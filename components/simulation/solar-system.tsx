"use client"

import { useRef, useState, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Text, Html } from "@react-three/drei"
import * as THREE from "three"

const PLANETS = [
  {
    name: "Mercury",
    radius: 0.22,
    orbitRadius: 4.5,
    speed: 0.047,
    color: "#b5b5b5",
    emissive: "#555555",
    description: "Closest to Sun",
  },
  {
    name: "Venus",
    radius: 0.38,
    orbitRadius: 6.5,
    speed: 0.035,
    color: "#e8cda0",
    emissive: "#7a5e2a",
    description: "Hottest planet",
  },
  {
    name: "Earth",
    radius: 0.4,
    orbitRadius: 9,
    speed: 0.029,
    color: "#4fa3d9",
    emissive: "#1a3d5c",
    description: "Our home",
  },
  {
    name: "Mars",
    radius: 0.3,
    orbitRadius: 12,
    speed: 0.024,
    color: "#c1440e",
    emissive: "#5a1a05",
    description: "The Red Planet",
  },
  {
    name: "Jupiter",
    radius: 0.9,
    orbitRadius: 17,
    speed: 0.013,
    color: "#c88b3a",
    emissive: "#5c3d18",
    description: "Largest planet",
  },
  {
    name: "Saturn",
    radius: 0.75,
    orbitRadius: 22,
    speed: 0.009,
    color: "#e4d191",
    emissive: "#7a6930",
    description: "Ringed giant",
  },
  {
    name: "Uranus",
    radius: 0.55,
    orbitRadius: 27,
    speed: 0.006,
    color: "#7de8e8",
    emissive: "#1a6060",
    description: "Ice giant",
  },
  {
    name: "Neptune",
    radius: 0.52,
    orbitRadius: 31,
    speed: 0.005,
    color: "#3f54ba",
    emissive: "#141d4a",
    description: "Farthest planet",
  },
]

function OrbitRing({ radius, isDestination }: { radius: number; isDestination: boolean }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

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

function Planet({
  data,
  isDestination,
  onClick,
}: {
  data: (typeof PLANETS)[0]
  isDestination: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const angleRef = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    angleRef.current += data.speed * delta * 0.5
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.orbitRadius
      groupRef.current.position.z = Math.sin(angleRef.current) * data.orbitRadius
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      {/* Selection ring */}
      {isDestination && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.radius + 0.15, data.radius + 0.3, 32]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Saturn rings */}
      {data.name === "Saturn" && (
        <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[data.radius + 0.2, data.radius + 0.7, 64]} />
          <meshBasicMaterial color="#c8b560" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Planet sphere */}
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

      {/* Label */}
      {(hovered || isDestination) && (
        <Html
          position={[0, data.radius + 0.5, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
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

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1
  })

  return (
    <group>
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ffb300" transparent opacity={0.12} />
      </mesh>
      {/* Sun surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#ffb300"
          emissive="#ff6600"
          emissiveIntensity={1.8}
          roughness={0.9}
        />
      </mesh>
      {/* Sun label */}
      <Text
        position={[0, 1.9, 0]}
        fontSize={0.3}
        color="#ffb300"
        anchorX="center"
        anchorY="bottom"
        font="/fonts/GeistMono-Regular.ttf"
      >
        SOL
      </Text>
      <pointLight color="#ffb300" intensity={6} distance={80} decay={1.2} />
    </group>
  )
}

interface SolarSystemProps {
  destinationPlanet: string
  onSelectPlanet: (name: string) => void
}

export function SolarSystem({ destinationPlanet, onSelectPlanet }: SolarSystemProps) {
  return (
    <div className="w-full h-full relative">
      {/* Instruction hint */}
      <div className="absolute top-2 right-2 z-10 text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border/30 bg-background/60 px-2 py-1 rounded pointer-events-none">
        Click planet to select target · Drag to orbit · Scroll to zoom
      </div>

      <Canvas
        camera={{ position: [0, 20, 40], fov: 55 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <fog attach="fog" args={["#050a10", 60, 120]} />

        <Stars radius={90} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />

        <Sun />

        {PLANETS.map((planet) => (
          <OrbitRing
            key={`orbit-${planet.name}`}
            radius={planet.orbitRadius}
            isDestination={destinationPlanet === planet.name}
          />
        ))}

        {PLANETS.map((planet) => (
          <Planet
            key={planet.name}
            data={planet}
            isDestination={destinationPlanet === planet.name}
            onClick={() => onSelectPlanet(planet.name)}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={70}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}

export { PLANETS }
