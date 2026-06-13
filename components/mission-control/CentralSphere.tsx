"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SystemStatus } from "@/lib/db/types";

const STATUS_COLOR: Record<SystemStatus, string> = {
  healthy: "#00d9ff",
  warning: "#ffab2e",
  error: "#ff3b5b",
};

/** Deterministic pseudo random generator (mulberry32), pure given a seed. */
function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ParticleField({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 2600;

  const positions = useMemo(() => {
    const rng = makeRng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute through a sphere volume, biased toward the shell.
      const r = 1.55 * Math.cbrt(0.55 + rng() * 0.45);
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += 0.0016;
    p.rotation.x += 0.0006;
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.03;
    p.scale.setScalar(s);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.027}
        color={color}
        transparent
        opacity={0.92}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Shell({ color }: { color: string }) {
  const ref = useRef<THREE.LineSegments>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y -= 0.0009;
  });
  return (
    <lineSegments ref={ref}>
      <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.85, 1)]} />
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </lineSegments>
  );
}

function Ring({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.25;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[2.35, 0.006, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

export default function CentralSphere({ status = "healthy" }: { status?: SystemStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ParticleField color={color} />
      <Shell color={color} />
      <Ring color={color} />
    </Canvas>
  );
}
