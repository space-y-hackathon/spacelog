import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'

function Rocket() {
  const rocketRef = useRef(null)

  useFrame((state, delta) => {
    if (!rocketRef.current) return
    rocketRef.current.rotation.y += delta * 0.12
    rocketRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08
  })

  return (
    <group ref={rocketRef} scale={1.15}>
      {/* Main fuselage */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 2.25, 32]} />
        <meshStandardMaterial color="#dce6ec" metalness={0.48} roughness={0.32} />
      </mesh>

      {/* Nose cone */}
      <mesh castShadow position={[0, 1.42, 0]}>
        <coneGeometry args={[0.24, 0.62, 32]} />
        <meshStandardMaterial color="#80d9f2" metalness={0.5} roughness={0.28} />
      </mesh>

      {/* Top and lower bands */}
      <mesh position={[0, 0.77, 0]}>
        <cylinderGeometry args={[0.247, 0.247, 0.09, 32]} />
        <meshStandardMaterial color="#498eae" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.88, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.12, 32]} />
        <meshStandardMaterial color="#498eae" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Cockpit / sensor window */}
      <mesh position={[0, 0.34, 0.225]}>
        <sphereGeometry args={[0.105, 24, 24]} />
        <meshStandardMaterial color="#42bce8" emissive="#12658c" emissiveIntensity={0.8} metalness={0.4} roughness={0.18} />
      </mesh>

      {/* Engine nozzle */}
      <mesh castShadow position={[0, -1.25, 0]}>
        <cylinderGeometry args={[0.14, 0.23, 0.48, 32]} />
        <meshStandardMaterial color="#657889" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.51, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.08, 32]} />
        <meshStandardMaterial color="#23394b" metalness={0.8} roughness={0.35} />
      </mesh>

      {/* Stabilizing fins */}
      {[-1, 1].map((side) => (
        <mesh key={side} castShadow position={[side * 0.29, -0.78, 0]} rotation={[0, 0, side * -0.12]}>
          <boxGeometry args={[0.16, 0.72, 0.12]} />
          <meshStandardMaterial color="#8ba3b5" metalness={0.45} roughness={0.38} />
        </mesh>
      ))}
      <mesh castShadow position={[0, -0.78, 0.29]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.12, 0.72, 0.16]} />
        <meshStandardMaterial color="#8ba3b5" metalness={0.45} roughness={0.38} />
      </mesh>
    </group>
  )
}

function Planet() {
  return (
    <group position={[2.8, -3.45, -4.5]}>
      <mesh>
        <sphereGeometry args={[3.3, 64, 64]} />
        <meshStandardMaterial color="#17476c" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2.35, 0.15, 0.3]}>
        <torusGeometry args={[3.55, 0.025, 8, 120]} />
        <meshBasicMaterial color="#5aaed0" transparent opacity={0.42} />
      </mesh>
    </group>
  )
}

export default function MenuScene() {
  return (
    <Canvas camera={{ position: [4.2, 1.2, 7.4], fov: 37 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} color="#e8f7ff" />
      <pointLight position={[-3, 1, 3]} intensity={24} color="#45bfe9" />
      <pointLight position={[2, -2, -3]} intensity={12} color="#286da2" />

      <Stars radius={75} depth={55} count={1800} factor={3.2} saturation={0} fade speed={0.35} />
      <Planet />
      <Float speed={1.15} rotationIntensity={0.07} floatIntensity={0.22}>
        <Rocket />
      </Float>
    </Canvas>
  )
}
