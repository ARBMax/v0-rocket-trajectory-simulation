"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Text, Html } from "@react-three/drei"
import * as THREE from "three"
import type { SimulationState, SimulationResult } from "@/lib/rocket-physics"

// Earth is always the departure — fixed, not selectable as destination
const EARTH = { name: "Earth", radius: 0.40, orbitRadius: 9.0, speed: 0.029, color: "#4fa3d9", emissive: "#1a3d5c" }

export const PLANETS = [
  { name: "Mercury", radius: 0.22, orbitRadius: 4.5,  speed: 0.047, color: "#b5b5b5", emissive: "#555555", description: "Closest to Sun" },
  { name: "Venus",   radius: 0.38, orbitRadius: 6.5,  speed: 0.035, color: "#e8cda0", emissive: "#7a5e2a", description: "Hottest planet" },
  { name: "Mars",    radius: 0.30, orbitRadius: 12.0, speed: 0.024, color: "#c1440e", emissive: "#5a1a05", description: "The Red Planet" },
  { name: "Jupiter", radius: 0.90, orbitRadius: 17.0, speed: 0.013, color: "#c88b3a", emissive: "#5c3d18", description: "Largest planet" },
  { name: "Saturn",  radius: 0.75, orbitRadius: 22.0, speed: 0.009, color: "#e4d191", emissive: "#7a6930", description: "Ringed giant" },
  { name: "Uranus",  radius: 0.55, orbitRadius: 27.0, speed: 0.006, color: "#7de8e8", emissive: "#1a6060", description: "Ice giant" },
  { name: "Neptune", radius: 0.52, orbitRadius: 31.0, speed: 0.005, color: "#3f54ba", emissive: "#141d4a", description: "Farthest planet" },
]

const EARTH_ORBIT = EARTH.orbitRadius

// ─── Earth (fixed departure) ──────────────────────────────────────────────────
function EarthDeparture() {
  const meshRef  = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5
  })

  // Fixed position at angle 0 on Earth's orbit
  const earthX = EARTH.orbitRadius
  const earthZ = 0

  return (
    <group position={[earthX, 0, earthZ]}>
      {/* Departure glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[EARTH.radius + 0.15, EARTH.radius + 0.28, 32]} />
        <meshBasicMaterial color="#4fa3d9" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH.radius, 32, 32]} />
        <meshStandardMaterial
          color={EARTH.color}
          emissive={EARTH.emissive}
          emissiveIntensity={0.4}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <Html position={[0, EARTH.radius + 0.55, 0]} center style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap text-[#4fa3d9] border-[#4fa3d9]/50 bg-background/80">
          Earth — Departure
        </div>
      </Html>
    </group>
  )
}

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing({ radius, isDestination }: { radius: number; isDestination: boolean }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={isDestination ? "#00ffcc" : "#334455"}
        opacity={isDestination ? 0.8 : 0.3}
        transparent
      />
    </line>
  )
}

// ─── Rocket Transfer Path (Hohmann-style arc from Earth to destination) ───────
function RocketPath({
  destinationOrbit,
  progress,           // 0..1 how far along the journey
  active,
}: {
  destinationOrbit: number
  progress: number
  active: boolean
}) {
  // Build a smooth arc from Earth position (9,0) to destination position
  // using a half-ellipse (Hohmann transfer approximation) in the XZ plane
  const { arcPoints, travelledPoints } = useMemo(() => {
    const startR = EARTH_ORBIT
    const endR   = destinationOrbit
    const semiMajor = (startR + endR) / 2
    const semiMinor = Math.sqrt(startR * endR) * 0.85 // slight squash for visual appeal

    const N = 120
    const arc: THREE.Vector3[] = []
    for (let i = 0; i <= N; i++) {
      // angle from 0 (Earth side) to PI (destination side)
      const t = (i / N) * Math.PI
      const x = Math.cos(t) * semiMajor
      const z = Math.sin(t) * semiMinor
      arc.push(new THREE.Vector3(x, 0.08, z))
    }
    // Travelled portion
    const cutoff = Math.round(progress * N)
    const travelled = arc.slice(0, cutoff + 1)
    return { arcPoints: arc, travelledPoints: travelled }
  }, [destinationOrbit, progress])

  const fullGeo     = useMemo(() => new THREE.BufferGeometry().setFromPoints(arcPoints),     [arcPoints])
  const travelledGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(travelledPoints), [travelledPoints])

  if (!active) {
    console.log("[v0] RocketPath NOT rendering - active is false. progress:", progress)
    return null
  }
  console.log("[v0] RocketPath rendering. progress:", progress.toFixed(3), "traveled points:", travelledPoints.length)

  return (
    <group>
      {/* Ghost path (full arc, dim) */}
      <line geometry={fullGeo}>
        <lineBasicMaterial color="#00ffcc" opacity={0.15} transparent />
      </line>
      {/* Travelled portion (bright cyan) */}
      {travelledPoints.length > 1 && (
        <line geometry={travelledGeo}>
          <lineBasicMaterial color="#00ffcc" opacity={0.85} transparent />
        </line>
      )}
    </group>
  )
}

// ─── Animated Rocket Dot along the transfer arc ───────────────────────────────
function RocketDot({
  destinationOrbit,
  progress,
  active,
  planetAngleRef,
  onActualPhaseChange,
}: {
  destinationOrbit: number
  progress: number
  active: boolean
  planetAngleRef: React.MutableRefObject<number>
  onActualPhaseChange?: (phase: number) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const rocketPhaseRef = useRef<number>(0)
  const hasLaunchedRef = useRef<boolean>(false)
  const launchProgressRef = useRef<number>(0)

  const startR   = EARTH_ORBIT
  const endR     = destinationOrbit
  const semiMajor = (startR + endR) / 2
  const semiMinor = Math.sqrt(startR * endR) * 0.85

  // useFrame runs every frame - check planet angle and update rocket position here
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    
    // Glow pulsing animation
    if (glowRef.current) {
      const s = 1 + 0.3 * Math.sin(clock.getElapsedTime() * 4)
      glowRef.current.scale.setScalar(s)
    }

    // SINGLE SOURCE OF TRUTH: Calculate rocketPhase based on planet position
    // Rocket waits at Earth until the planet reaches the correct intercept angle
    let newRocketPhase = 0
    
    if (active && progress > 0) {
      // For Hohmann transfer, the intercept angle is at π (180°)
      const targetInterceptAngle = Math.PI
      
      // Calculate angular gap from current planet position to intercept
      const currentPlanetAngle = planetAngleRef.current
      
      // Normalize the angle difference to [0, 2π)
      let angularGap = (targetInterceptAngle - currentPlanetAngle + Math.PI * 2) % (Math.PI * 2)
      
      // Shortest distance (could be forward or backward around the circle)
      if (angularGap > Math.PI) {
        angularGap = Math.PI * 2 - angularGap
      }
      
      // Launch window: planet must be within ~10 degrees of intercept (0.175 radians)
      // This is a tight tolerance for precise launch timing
      const launchWindowSize = 0.175
      const isInLaunchWindow = angularGap < launchWindowSize
      
      // First time entering launch window: capture progress and mark as launched
      if (isInLaunchWindow && !hasLaunchedRef.current) {
        hasLaunchedRef.current = true
        launchProgressRef.current = progress
      }
      
      // If rocket has launched, use the progress from launch moment to current
      // This ensures smooth motion from the exact launch point onwards
      if (hasLaunchedRef.current) {
        newRocketPhase = progress - launchProgressRef.current
      }
      // else: rocket stays in waiting state (newRocketPhase = 0)
    } else {
      // Simulation ended or not active - reset launch state
      hasLaunchedRef.current = false
      launchProgressRef.current = 0
      newRocketPhase = 0
    }

    // Notify parent if phase changed
    if (rocketPhaseRef.current !== newRocketPhase) {
      rocketPhaseRef.current = newRocketPhase
      onActualPhaseChange?.(newRocketPhase)
    }

    // Calculate rocket position based on phase
    let x = EARTH_ORBIT  // Default: Earth's orbit (angle 0)
    let z = 0
    
    if (newRocketPhase > 0) {
      // Rocket is traveling along the Hohmann transfer arc
      const arcAngle = newRocketPhase * Math.PI
      x = Math.cos(arcAngle) * semiMajor
      z = Math.sin(arcAngle) * semiMinor

      // At the final approach, smoothly transition to planet's orbital position
      if (newRocketPhase > 0.85) {
        const approachFactor = (newRocketPhase - 0.85) / 0.15
        const destX = Math.cos(planetAngleRef.current) * destinationOrbit
        const destZ = Math.sin(planetAngleRef.current) * destinationOrbit
        x = x + (destX - x) * approachFactor
        z = z + (destZ - z) * approachFactor
      }
    }

    // Update position - this happens every frame, ensuring smooth continuous motion
    groupRef.current.position.set(x, 0.08, z)
  })

  // Notify parent on mount with initial state (waiting)
  useEffect(() => {
    onActualPhaseChange?.(0)
  }, [])

  if (!active) return null

  // Initial position at Earth (will be updated by useFrame)
  return (
    <group ref={groupRef} position={[EARTH_ORBIT, 0.08, 0]}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.25} />
      </mesh>
      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ffcc" emissiveIntensity={2} />
      </mesh>
      {/* Label */}
      <Html position={[0, 0.45, 0]} center style={{ pointerEvents: "none" }}>
        <div className="font-mono text-[9px] uppercase tracking-widest text-primary whitespace-nowrap
                        border border-primary/50 bg-background/80 px-1.5 py-0.5 rounded">
          {rocketPhaseRef.current > 0 ? `Rocket — ${Math.round(rocketPhaseRef.current * 100)}%` : `Waiting for intercept`}
        </div>
      </Html>
    </group>
  )
}

// ─── Planet ───────────────────────────────────────────────────────────────────
function Planet({
  data,
  isDestination,
  onClick,
  playbackSpeed = 1,
  onAngleUpdate,
}: {
  data: (typeof PLANETS)[0]
  isDestination: boolean
  onClick: () => void
  playbackSpeed: number
  onAngleUpdate?: (angle: number) => void
}) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const angleRef = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    console.log("[v0] Planet", data.name, "useFrame called. speedDelta:", (data.speed * delta * 0.5 * playbackSpeed).toFixed(6), "playbackSpeed:", playbackSpeed)
    angleRef.current += data.speed * delta * 0.5 * playbackSpeed
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.orbitRadius
      groupRef.current.position.z = Math.sin(angleRef.current) * data.orbitRadius
      if (onAngleUpdate) onAngleUpdate(angleRef.current)
    }
    if (meshRef.current) {
      // Rotate planet on its axis - increased speed to 1.0 for better visibility
      meshRef.current.rotation.y += delta * 1.0 * playbackSpeed
    }
  })

  return (
    <group ref={groupRef}>
      {isDestination && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.radius + 0.15, data.radius + 0.3, 32]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {data.name === "Saturn" && (
        <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[data.radius + 0.2, data.radius + 0.7, 64]} />
          <meshBasicMaterial color="#c8b560" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[data.radius, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.emissive}
          emissiveIntensity={isDestination ? 0.6 : 0.2}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {(hovered || isDestination) && (
        <Html position={[0, data.radius + 0.5, 0]} center style={{ pointerEvents: "none" }}>
          <div className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap ${
            isDestination
              ? "text-primary border-primary/60 bg-background/80"
              : "text-foreground border-border/50 bg-background/70"
          }`}>
            {data.name}
            {isDestination && <span className="ml-1 text-primary">— Target</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Sun ──────────────────────────────────────────────────────────────────────
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.1 })
  return (
    <group>
      <mesh><sphereGeometry args={[1.8, 32, 32]} /><meshBasicMaterial color="#ff8c00" transparent opacity={0.08} /></mesh>
      <mesh><sphereGeometry args={[1.5, 32, 32]} /><meshBasicMaterial color="#ffb300" transparent opacity={0.12} /></mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#ffb300" emissive="#ff6600" emissiveIntensity={1.8} roughness={0.9} />
      </mesh>
      <Text position={[0, 1.9, 0]} fontSize={0.3} color="#ffb300" anchorX="center" anchorY="bottom">SOL</Text>
      <pointLight color="#ffb300" intensity={6} distance={80} decay={1.2} />
    </group>
  )
}

// ─── Scene (needs to be inside Canvas) ───────────────────────────────────────
function Scene({
  destinationPlanet,
  onSelectPlanet,
  rocketProgress,
  playbackSpeed = 1,
  hasResult = false,
  onActualPhaseChange,
  planetAngleRef,
}: {
  destinationPlanet: string
  onSelectPlanet: (name: string) => void
  rocketProgress: number
  playbackSpeed: number
  hasResult?: boolean
  onActualPhaseChange?: (phase: number) => void
  planetAngleRef: React.MutableRefObject<number>
}) {
  const destData = PLANETS.find(p => p.name === destinationPlanet) ?? PLANETS[3]
  // Show rocket if it's in flight (progress > 0) OR if a simulation is loaded but waiting (hasResult && progress === 0)
  const hasJourney = rocketProgress > 0 || hasResult

  return (
    <>
      <ambientLight intensity={0.15} />
      <fog attach="fog" args={["#050a10", 60, 120]} />
      <Stars radius={90} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <Sun />

      {/* Earth orbit ring (always shown as departure) */}
      <OrbitRing radius={EARTH.orbitRadius} isDestination={false} />

      {/* Orbit rings for selectable planets */}
      {PLANETS.map(p => (
        <OrbitRing key={`orbit-${p.name}`} radius={p.orbitRadius} isDestination={destinationPlanet === p.name} />
      ))}

      {/* Fixed Earth departure marker */}
      <EarthDeparture />

      {/* Transfer arc + rocket dot */}
      <RocketPath
        destinationOrbit={destData.orbitRadius}
        progress={rocketProgress}
        active={hasJourney}
      />
      <RocketDot
        destinationOrbit={destData.orbitRadius}
        progress={rocketProgress}
        active={hasJourney}
        planetAngleRef={planetAngleRef}
        onActualPhaseChange={onActualPhaseChange}
      />

      {/* Planets */}
      {PLANETS.map(p => (
        <Planet
          key={p.name}
          data={p}
          isDestination={destinationPlanet === p.name}
          onClick={() => onSelectPlanet(p.name)}
          playbackSpeed={playbackSpeed}
          onAngleUpdate={destinationPlanet === p.name ? (angle) => (planetAngleRef.current = angle) : undefined}
        />
      ))}

      <OrbitControls enablePan={false} minDistance={8} maxDistance={70} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────
interface SolarSystemProps {
  destinationPlanet: string
  onSelectPlanet: (name: string) => void
  result?: SimulationResult | null
  currentState?: SimulationState | null
  onActualPhaseChange?: (phase: number) => void
}

export function SolarSystem({ destinationPlanet, onSelectPlanet, result, currentState, playbackSpeed = 1, onActualPhaseChange }: SolarSystemProps & { playbackSpeed?: number }) {
  // Persistent ref that survives Scene re-renders - holds the destination planet's current orbital angle
  const planetAngleRef = useRef(0)
  
  // Map simulation progress to journey fraction (0→1)
  // The rocket should travel the full arc to destination based on the flight phases
  const rocketProgress = useMemo(() => {
    if (!result) return 0
    if (!currentState) return 0 // In waiting state - still show rocket at position 0
    if (result.states.length < 2) return 0
    
    // Find current index in simulation states
    const currentIndex = result.states.indexOf(currentState)
    if (currentIndex < 0) return 0
    
    // Normalize progress across entire simulation duration
    // This maps the complete flight (launch → burnout → apogee → descent → landing)
    // to the full Hohmann transfer arc from Earth to destination
    const totalStates = result.states.length - 1
    const normalizedProgress = currentIndex / totalStates
    
    // Stretch the progress so the rocket actually reaches the destination
    // The journey completes when normalizedProgress reaches 1.0
    return Math.min(1, normalizedProgress)
  }, [result, currentState])

  // hasResult indicates if there's a simulation loaded (for display purposes)
  const hasResult = !!result

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 z-10 text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border/30 bg-background/60 px-2 py-1 rounded pointer-events-none">
        Click planet to select target · Drag to orbit · Scroll to zoom
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border/30 bg-background/60 px-3 py-1.5 rounded pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-px bg-[#00ffcc]" />
          Transfer arc
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00ffcc]" />
          Rocket
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-px bg-[#334455]" />
          Orbit
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 20, 40], fov: 55 }}
        style={{ width: "100%", height: "100%", background: "#020c14" }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene
          destinationPlanet={destinationPlanet}
          onSelectPlanet={onSelectPlanet}
          rocketProgress={rocketProgress}
          playbackSpeed={playbackSpeed}
          hasResult={hasResult}
          onActualPhaseChange={onActualPhaseChange}
          planetAngleRef={planetAngleRef}
        />
      </Canvas>
    </div>
  )
}
