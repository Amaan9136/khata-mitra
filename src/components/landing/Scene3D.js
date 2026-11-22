"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
function docTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const g = c.getContext("2d");
  g.fillStyle = "#ecfdf5";
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#0f6857";
  g.fillRect(0, 0, 256, 44);
  g.fillStyle = "#bef264";
  g.fillRect(18, 16, 70, 12);
  g.fillStyle = "#b6cfc8";
  [74, 100, 126, 152, 178].forEach((y, i) => g.fillRect(24, y, i % 2 ? 150 : 208, 9));
  g.strokeStyle = "#0f6857";
  g.lineWidth = 3;
  g.strokeRect(24, 206, 90, 70);
  g.beginPath();
  g.moveTo(24, 241);
  g.lineTo(114, 241);
  g.moveTo(69, 206);
  g.lineTo(69, 276);
  g.stroke();
  g.fillStyle = "#bef264";
  g.beginPath();
  g.arc(190, 250, 34, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#052e2b";
  g.lineWidth = 8;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(173, 250);
  g.lineTo(186, 263);
  g.lineTo(208, 236);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const HEIGHTS = [0.22, 0.34, 0.18, 0.3, 0.2, 0.38, 0.16, 0.28, 0.24];
const COLORS = ["#2dd4bf", "#0f6857", "#5eead4", "#0a4a3d"];
function Parcels() {
  const group = useRef();
  const pulse = useRef();
  const vel = useRef(0);
  const drag = useRef(false);
  const hover = useRef(false);
  useFrame((st, d) => {
    if (!drag.current) group.current.rotation.y += d * (hover.current ? 0.1 : 0.3) + vel.current * d;
    vel.current *= Math.exp(-d * 2.5);
    pulse.current.material.emissiveIntensity = 0.5 + Math.sin(st.clock.elapsedTime * 2.4) * 0.35;
  });
  return (
    <group
      ref={group}
      rotation={[0.55, 0.4, 0]}
      onPointerOver={(e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = "grab"; }}
      onPointerOut={() => { hover.current = false; drag.current = false; document.body.style.cursor = ""; }}
      onPointerDown={(e) => { e.stopPropagation(); drag.current = true; e.target.setPointerCapture(e.pointerId); document.body.style.cursor = "grabbing"; }}
      onPointerMove={(e) => { if (!drag.current) return; const dx = e.nativeEvent.movementX * 0.012; group.current.rotation.y += dx; vel.current = THREE.MathUtils.clamp(dx / 0.016, -8, 8); }}
      onPointerUp={(e) => { drag.current = false; e.target.releasePointerCapture(e.pointerId); document.body.style.cursor = "grab"; }}
    >
      {HEIGHTS.map((h, i) => {
        const x = (i % 3) - 1;
        const z = Math.floor(i / 3) - 1;
        const hot = i === 5;
        return (
          <mesh key={i} ref={hot ? pulse : undefined} position={[x * 1.05, h / 2, z * 1.05]}>
            <boxGeometry args={[0.95, hot ? 0.5 : h, 0.95]} />
            <meshStandardMaterial color={hot ? "#bef264" : COLORS[i % 4]} emissive={hot ? "#bef264" : "#000000"} emissiveIntensity={hot ? 0.6 : 0} roughness={0.45} metalness={0.1} transparent opacity={hot ? 1 : 0.85} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[3.4, 0.04, 3.4]} />
        <meshStandardMaterial color="#052e2b" roughness={0.7} />
      </mesh>
    </group>
  );
}
function Doc() {
  const tex = useMemo(() => docTexture(), []);
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.2}>
      <mesh position={[0, 1.55, 0.4]} rotation={[-0.15, 0, 0.06]}>
        <planeGeometry args={[1.3, 1.62]} />
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
      </mesh>
    </Float>
  );
}
function Orbit({ radius, speed, tilt, color }) {
  const ref = useRef();
  const dot = useRef();
  useFrame((st) => {
    const t = st.clock.elapsedTime * speed;
    ref.current.rotation.z += 0.0015;
    dot.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
  });
  return (
    <group rotation={[tilt, 0.3, 0]}>
      <group ref={ref}>
        <mesh>
          <torusGeometry args={[radius, 0.008, 8, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      </group>
      <mesh ref={dot}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
function Particles({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 11;
      a[i * 3 + 1] = (Math.random() - 0.5) * 8;
      a[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return a;
  }, [count]);
  useFrame((_, d) => { ref.current.rotation.y += d * 0.03; ref.current.rotation.x += d * 0.01; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#5eead4" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}
function Leaf({ position, rotation, scale = 1 }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.45, 0.3, 0, 1);
    s.quadraticCurveTo(-0.45, 0.3, 0, 0);
    return s;
  }, []);
  return (
    <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.6}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#84cc16" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
    </Float>
  );
}
export default function Scene3D() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const fn = () => setSmall(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return (
    <Canvas style={{ touchAction: "pan-y" }} dpr={small ? [1, 1.5] : [1, 2]} camera={{ position: [0, 0.4, small ? 7.4 : 6.2], fov: 45 }} gl={{ antialias: !small, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} color="#ecfdf5" />
      <pointLight position={[-4, -2, 2]} intensity={14} color="#2dd4bf" />
      <pointLight position={[3, 2, -3]} intensity={10} color="#bef264" />
      <group scale={small ? 0.8 : 1} position={[0, -0.5, 0]}>
        <Parcels />
        <Doc />
      </group>
      <Orbit radius={2.4} speed={0.8} tilt={1.1} color="#5eead4" />
      <Orbit radius={3} speed={-0.55} tilt={-0.7} color="#bef264" />
      {!small && <Orbit radius={3.6} speed={0.35} tilt={0.3} color="#2dd4bf" />}
      <Particles count={small ? 90 : 220} />
      <Leaf position={[-2.8, 1.2, 0.5]} rotation={[0, 0, 0.6]} scale={0.7} />
      <Leaf position={[2.8, -1.3, 0.4]} rotation={[0, 0, -2.4]} scale={0.55} />
      {!small && <Leaf position={[2.5, 1.8, -0.5]} rotation={[0, 0, -0.5]} scale={0.45} />}
    </Canvas>
  );
}
