// Rocket physics simulation engine

export interface RocketParams {
  mass: number // kg - initial rocket mass
  fuelMass: number // kg - fuel mass
  thrust: number // N - thrust force
  burnRate: number // kg/s - fuel consumption rate
  dragCoefficient: number // dimensionless
  crossSectionalArea: number // m²
}

export interface SimulationState {
  time: number // s
  height: number // m
  velocity: number // m/s
  acceleration: number // m/s²
  mass: number // kg - current mass (decreases as fuel burns)
  fuelRemaining: number // kg
  phase: "powered" | "coasting" | "descending" | "landed"
  thrust: number // current thrust (N)
  dragForce: number // N
  gravityForce: number // N
  netForce: number // N
}

export interface SimulationResult {
  states: SimulationState[]
  maxHeight: number
  maxVelocity: number
  flightTime: number
  burnoutTime: number
  burnoutHeight: number
  apogeeTime: number
}

// Physical constants
const GRAVITY = 9.81 // m/s²
const AIR_DENSITY_SEA_LEVEL = 1.225 // kg/m³

// Calculate air density at altitude (exponential atmosphere model)
function getAirDensity(altitude: number): number {
  const scaleHeight = 8500 // m
  return AIR_DENSITY_SEA_LEVEL * Math.exp(-altitude / scaleHeight)
}

// Calculate drag force
function calculateDrag(
  velocity: number,
  altitude: number,
  dragCoefficient: number,
  area: number
): number {
  const airDensity = getAirDensity(altitude)
  // Drag = 0.5 * ρ * v² * Cd * A
  const dragMagnitude =
    0.5 * airDensity * velocity * velocity * dragCoefficient * area
  // Drag opposes velocity direction
  return velocity >= 0 ? -dragMagnitude : dragMagnitude
}

// Run physics simulation
export function simulateRocket(
  params: RocketParams,
  dt: number = 0.01, // time step in seconds
  maxTime: number = 300 // max simulation time
): SimulationResult {
  const states: SimulationState[] = []

  let time = 0
  let height = 0
  let velocity = 0
  let mass = params.mass + params.fuelMass
  let fuelRemaining = params.fuelMass

  let maxHeight = 0
  let maxVelocity = 0
  let burnoutTime = 0
  let burnoutHeight = 0
  let apogeeTime = 0
  let reachedApogee = false

  while (time <= maxTime) {
    // Determine phase
    let phase: SimulationState["phase"]
    let currentThrust = 0

    if (fuelRemaining > 0) {
      phase = "powered"
      currentThrust = params.thrust
    } else if (velocity > 0) {
      phase = "coasting"
    } else if (height > 0) {
      phase = "descending"
    } else {
      phase = "landed"
    }

    // Calculate forces
    const gravityForce = -mass * GRAVITY

    const dragForce = calculateDrag(
      velocity,
      Math.max(0, height),
      params.dragCoefficient,
      params.crossSectionalArea
    )

    const netForce = currentThrust + gravityForce + dragForce

    // Calculate acceleration: F = ma → a = F/m
    const acceleration = netForce / mass

    // Record state
    const state: SimulationState = {
      time: Math.round(time * 100) / 100,
      height: Math.max(0, height),
      velocity,
      acceleration,
      mass,
      fuelRemaining,
      phase,
      thrust: currentThrust,
      dragForce,
      gravityForce,
      netForce,
    }
    states.push(state)

    // Track maximums
    if (height > maxHeight) {
      maxHeight = height
      apogeeTime = time
    }
    if (Math.abs(velocity) > maxVelocity) {
      maxVelocity = Math.abs(velocity)
    }

    // Track burnout
    if (fuelRemaining > 0 && fuelRemaining - params.burnRate * dt <= 0) {
      burnoutTime = time
      burnoutHeight = height
    }

    // Track apogee
    if (!reachedApogee && velocity < 0 && height > 0) {
      reachedApogee = true
    }

    // Check if landed
    if (phase === "landed") {
      break
    }

    // Update state using Euler integration
    velocity += acceleration * dt
    height += velocity * dt

    // Prevent going below ground
    if (height < 0) {
      height = 0
      velocity = 0
    }

    // Consume fuel
    if (fuelRemaining > 0) {
      fuelRemaining = Math.max(0, fuelRemaining - params.burnRate * dt)
      mass = params.mass + fuelRemaining
    }

    time += dt
  }

  return {
    states,
    maxHeight,
    maxVelocity,
    flightTime: time,
    burnoutTime,
    burnoutHeight,
    apogeeTime,
  }
}

// Calculate expected theoretical values for comparison
export function calculateTheoreticalValues(params: RocketParams): {
  idealMaxHeight: number
  idealBurnoutVelocity: number
  burnTime: number
} {
  const burnTime = params.fuelMass / params.burnRate
  const avgMass = params.mass + params.fuelMass / 2

  // Simplified calculation (ignoring drag)
  // Net acceleration during burn = (T/m) - g
  const avgAcceleration = params.thrust / avgMass - GRAVITY

  // Velocity at burnout: v = a * t
  const burnoutVelocity = avgAcceleration * burnTime

  // Height at burnout: h = 0.5 * a * t²
  const burnoutHeight = 0.5 * avgAcceleration * burnTime * burnTime

  // Additional height during coast: v² = v₀² - 2gh
  const coastHeight =
    burnoutVelocity > 0
      ? (burnoutVelocity * burnoutVelocity) / (2 * GRAVITY)
      : 0

  return {
    idealMaxHeight: Math.max(0, burnoutHeight + coastHeight),
    idealBurnoutVelocity: Math.max(0, burnoutVelocity),
    burnTime,
  }
}

// Calculate max fuel mass based on rocket parameters
export function getMaxFuelMass(params: Partial<RocketParams>): number {
  // Use thrust as primary indicator of rocket size
  const thrust = params.thrust || 1
  
  // Map thrust ranges to fuel mass limits (realistic for various rocket classes)
  if (thrust < 10) {
    // Model rockets: small fuel capacity
    return 0.5 // kg
  } else if (thrust < 100) {
    // High-power model rockets
    return 5 // kg
  } else if (thrust < 1000) {
    // Small commercial rockets
    return 50 // kg
  } else if (thrust < 10000) {
    // Medium rockets
    return 200 // kg
  } else if (thrust < 50000) {
    // Large rockets (e.g., Falcon 9 first stage: ~528,000 kN, holds ~111,000 kg fuel per tank)
    return 500 // kg
  } else if (thrust < 500000) {
    // Heavy-lift rockets (e.g., Falcon Heavy: ~2,267,000 kN)
    return 100000 // kg
  } else if (thrust < 2000000) {
    // Super heavy-lift (e.g., Ariane 5: ~260,000 kN)
    return 240000 // kg
  } else {
    // Mega rockets (e.g., Saturn V: ~3,400,000 kN, Space Shuttle: ~2,900,000 kg fuel)
    return 3000000 // kg
  }
}

// Preset rocket configurations
export const ROCKET_PRESETS: Record<string, RocketParams> = {
  "Model Rocket": {
    mass: 0.1,
    fuelMass: 0.02,
    thrust: 8,
    burnRate: 0.01,
    dragCoefficient: 0.5,
    crossSectionalArea: 0.001,
  },
  "Small Sounding Rocket": {
    mass: 50,
    fuelMass: 30,
    thrust: 5000,
    burnRate: 3,
    dragCoefficient: 0.4,
    crossSectionalArea: 0.03,
  },
  "Medium Rocket": {
    mass: 500,
    fuelMass: 400,
    thrust: 50000,
    burnRate: 20,
    dragCoefficient: 0.35,
    crossSectionalArea: 0.5,
  },
  Custom: {
    mass: 100,
    fuelMass: 80,
    thrust: 10000,
    burnRate: 5,
    dragCoefficient: 0.4,
    crossSectionalArea: 0.1,
  },
}

// Calculate Hohmann transfer time and telemetry data
export function calculateHohmannTransfer(
  departureOrbitRadius: number, // meters (Earth's orbital radius)
  arrivalOrbitRadius: number,   // meters (destination planet's orbital radius)
  sunMass: number = 1.989e30,   // kg (Sun's mass)
): {
  transferTime: number           // seconds
  transferTimeHours: number      // hours
  transferTimeDays: number       // days
  semiMajorAxis: number          // meters
  departureVelocity: number      // m/s (orbital velocity at Earth)
  arrivalVelocity: number        // m/s (orbital velocity at destination)
  deltaV: number                 // m/s (total velocity change needed)
} {
  const G = 6.674e-11 // gravitational constant
  
  // Hohmann transfer semi-major axis: (r1 + r2) / 2
  const semiMajorAxis = (departureOrbitRadius + arrivalOrbitRadius) / 2
  
  // Transfer time using Kepler's third law: T = 2π√(a³/GM)
  // For half the transfer ellipse: t_transfer = π√(a³/GM)
  const transferTimeSeconds = Math.PI * Math.sqrt((semiMajorAxis ** 3) / (G * sunMass))
  
  // Orbital velocities: v = √(GM/r)
  const departureVelocity = Math.sqrt((G * sunMass) / departureOrbitRadius)
  const arrivalVelocity = Math.sqrt((G * sunMass) / arrivalOrbitRadius)
  
  // Transfer orbit velocities at perihelion (departure) and aphelion (arrival)
  const transferPeriVelocity = Math.sqrt((G * sunMass) * (2 / departureOrbitRadius - 1 / semiMajorAxis))
  const transferApoVelocity = Math.sqrt((G * sunMass) * (2 / arrivalOrbitRadius - 1 / semiMajorAxis))
  
  // Total delta-v for Hohmann transfer
  const deltaV_depart = transferPeriVelocity - departureVelocity
  const deltaV_arrive = arrivalVelocity - transferApoVelocity
  const deltaV = deltaV_depart + deltaV_arrive
  
  return {
    transferTime: transferTimeSeconds,
    transferTimeHours: transferTimeSeconds / 3600,
    transferTimeDays: transferTimeSeconds / (3600 * 24),
    semiMajorAxis,
    departureVelocity,
    arrivalVelocity,
    deltaV,
  }
}
