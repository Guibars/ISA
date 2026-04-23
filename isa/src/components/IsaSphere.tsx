import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface IsaSphereProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
}

const LiquidMesh = ({ isSpeaking, isListening, isThinking }: IsaSphereProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const core1Ref = useRef<THREE.Mesh>(null);
  const core2Ref = useRef<THREE.Mesh>(null);
  const core3Ref = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const mat1Ref = useRef<any>(null);
  const mat2Ref = useRef<any>(null);
  const mat3Ref = useRef<any>(null);

  useFrame((state) => {
    if (!core1Ref.current || !core2Ref.current || !core3Ref.current || !outerRef.current || !groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Distort and speed values based on state
    let distort = 0.4;
    let speed = 1.5;
    let groupScale = 1;

    if (isSpeaking) {
      distort = 0.8 + Math.sin(t * 10) * 0.2;
      speed = 3.5;
      groupScale = 1.05 + Math.sin(t * 8) * 0.05;
    } else if (isListening) {
      distort = 0.35 + Math.sin(t * 3) * 0.1;
      speed = 4; // Faster swirling when listening
    } else if (isThinking) {
      distort = 0.6;
      speed = 5;
    }

    if (mat1Ref.current && mat2Ref.current && mat3Ref.current) {
      mat1Ref.current.distort = THREE.MathUtils.lerp(mat1Ref.current.distort, distort, 0.1);
      mat1Ref.current.speed = THREE.MathUtils.lerp(mat1Ref.current.speed, speed, 0.1);
      mat2Ref.current.distort = THREE.MathUtils.lerp(mat2Ref.current.distort, distort, 0.1);
      mat2Ref.current.speed = THREE.MathUtils.lerp(mat2Ref.current.speed, speed, 0.1);
      mat3Ref.current.distort = THREE.MathUtils.lerp(mat3Ref.current.distort, distort, 0.1);
      mat3Ref.current.speed = THREE.MathUtils.lerp(mat3Ref.current.speed, speed, 0.1);
    }
    
    groupRef.current.scale.set(
       THREE.MathUtils.lerp(groupRef.current.scale.x, groupScale, 0.1),
       THREE.MathUtils.lerp(groupRef.current.scale.y, groupScale, 0.1),
       THREE.MathUtils.lerp(groupRef.current.scale.z, groupScale, 0.1)
    );

    // Swirling infinity-like (Lissajous curve) motion
    const timeScale = isListening ? 1.5 : (isThinking ? 2 : 0.8);
    const phase1 = t * timeScale;
    const phase2 = t * timeScale + Math.PI * 0.66;
    const phase3 = t * timeScale + Math.PI * 1.33;

    // By having x ~ sin(t) and y ~ sin(2t) we get an "8" or Infinity symbol.
    const spreadX = isThinking ? 0.3 : 0.45;
    const spreadY = isThinking ? 0.4 : 0.25;

    // Blue core
    core1Ref.current.position.x = Math.sin(phase1) * spreadX;
    core1Ref.current.position.y = Math.sin(phase1 * 2) * spreadY;
    core1Ref.current.position.z = Math.cos(phase1) * 0.3;
    core1Ref.current.rotation.x = t * 1.1;

    // Yellow core
    core2Ref.current.position.x = Math.sin(phase2) * spreadX;
    core2Ref.current.position.y = Math.sin(phase2 * 2) * spreadY;
    core2Ref.current.position.z = Math.cos(phase2) * 0.3;
    core2Ref.current.rotation.x = t * 1.2;

    // White core (smaller, adds brightness)
    core3Ref.current.position.x = Math.sin(phase3) * (spreadX * 0.7);
    core3Ref.current.position.y = Math.sin(phase3 * 2) * (spreadY * 0.7);
    core3Ref.current.position.z = Math.cos(phase3) * 0.2;
    core3Ref.current.rotation.x = -t * 1.5;
    
    // Outer sphere subtle float
    outerRef.current.position.y = Math.sin(t * 2) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Outer Frosted Liquid Glass */}
      <Sphere ref={outerRef} args={[1.2, 64, 64]}>
        <meshPhysicalMaterial 
          transmission={1}
          transparent={true}
          roughness={0.35} // The magic for frosted blur!
          thickness={3.5} 
          ior={1.4} 
          color="#ffffff" 
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          envMapIntensity={1}
        />
      </Sphere>

      {/* Inner Swirl 1 (Blue) */}
      <Sphere ref={core1Ref} args={[0.7, 64, 64]}>
        <MeshDistortMaterial ref={mat1Ref} color="#0D518E" emissive="#0D518E" emissiveIntensity={1.5} distort={0.5} speed={2} roughness={0.5} />
      </Sphere>

      {/* Inner Swirl 2 (Yellow) */}
      <Sphere ref={core2Ref} args={[0.65, 64, 64]}>
        <MeshDistortMaterial ref={mat2Ref} color="#FAB515" emissive="#FAB515" emissiveIntensity={2} distort={0.5} speed={2} roughness={0.5} />
      </Sphere>
      
      {/* Inner Swirl 3 (White/Cyan to bridge colors) */}
      <Sphere ref={core3Ref} args={[0.5, 64, 64]}>
        <MeshDistortMaterial ref={mat3Ref} color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} distort={0.6} speed={3} roughness={0.5} />
      </Sphere>
    </group>
  );
};

export default function IsaSphere(props: IsaSphereProps) {
  return (
    <div className="w-full h-full relative" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 3.5] }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={2} color="#ffffff" />
        <directionalLight position={[5, 10, 8]} intensity={4} color="#ffffff" />
        <directionalLight position={[-5, -10, -5]} intensity={2} color="#ffffff" />
        <LiquidMesh {...props} />
      </Canvas>
    </div>
  );
}
