"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
const V = [[-1.65, -1.5], [-0.55, -1.6], [0.6, -1.45], [1.7, -1.55], [-1.55, -0.5], [-0.45, -0.6], [0.55, -0.4], [1.6, -0.55], [-1.7, 0.55], [-0.5, 0.45], [0.45, 0.6], [1.65, 0.5], [-1.6, 1.6], [-0.6, 1.5], [0.5, 1.65], [1.7, 1.55]];
const LABELS = ["44", "45/1", "45/3", "46", "45/2", "47", "48/1", "48/2", "49"];
const HEIGHTS = [0.05, 0.08, 0.05, 0.07, 0.16, 0.08, 0.06, 0.05, 0.07];
const COLORS = ["#2dd4bf", "#0f6857", "#5eead4", "#0a4a3d"];
const HOT = 4;
const PLOTS = LABELS.map((label, i) => {
  const r = Math.floor(i / 3);
  const c = i % 3;
  const q = [V[r * 4 + c], V[r * 4 + c + 1], V[(r + 1) * 4 + c + 1], V[(r + 1) * 4 + c]];
  const cx = q.reduce((s, p) => s + p[0], 0) / 4;
  const cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return { label, h: HEIGHTS[i], cx, cy, pts: q.map(([x, y]) => [x + (cx - x) * 0.07, y + (cy - y) * 0.07]) };
});
function labelTexture(text, hot) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 80;
  const g = c.getContext("2d");
  g.fillStyle = hot ? "#052e2b" : "#ecfdf5";
  g.font = "700 40px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 80, 42);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function cardTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const g = c.getContext("2d");
  g.fillStyle = "#ecfdf5";
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#0f6857";
  g.fillRect(0, 0, 256, 48);
  g.textBaseline = "middle";
  g.fillStyle = "#ecfdf5";
  g.font = "700 20px sans-serif";
  g.fillText("KHATA MUTATION", 18, 25);
  g.fillStyle = "#476560";
  g.font = "600 17px sans-serif";
  g.fillText("Sy.No 45/2 · Kolathur", 18, 78);
  g.fillStyle = "#7a948f";
  g.font = "500 24px sans-serif";
  g.fillText("Muniyappa", 18, 122);
  g.fillRect(18, 122, g.measureText("Muniyappa").width, 2);
  g.strokeStyle = "#0f6857";
  g.lineWidth = 4;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(40, 144);
  g.lineTo(40, 168);
  g.moveTo(32, 160);
  g.lineTo(40, 168);
  g.lineTo(48, 160);
  g.stroke();
  g.fillStyle = "#052e2b";
  g.font = "700 28px sans-serif";
  g.fillText("Ramesh K", 18, 196);
  [0, 1, 2, 3].forEach((i) => {
    g.fillStyle = i < 3 ? "#2dd4bf" : "#b6cfc8";
    g.fillRect(18 + i * 56, 240, 48, 10);
  });
  g.fillStyle = "#476560";
  g.font = "600 15px sans-serif";
  g.fillText("Step 3 of 4", 18, 272);
  g.fillStyle = "#bef264";
  g.beginPath();
  g.arc(200, 280, 28, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#052e2b";
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(186, 280);
  g.lineTo(196, 290);
  g.lineTo(214, 268);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function Plot({ p, i, hot }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    p.pts.forEach(([x, y], n) => (n ? s.lineTo(x, y) : s.moveTo(x, y)));
    return new THREE.ExtrudeGeometry(s, { depth: p.h, bevelEnabled: false });
  }, [p]);
  const tex = useMemo(() => labelTexture(p.label, hot), [p, hot]);
  useFrame((st) => {
    if (hot) ref.current.material.emissiveIntensity = 0.45 + Math.sin(st.clock.elapsedTime * 2.4) * 0.3;
  });
  return (
    <>
      <mesh ref={ref} geometry={geo}>
        <meshStandardMaterial color={hot ? "#bef264" : COLORS[i % 4]} emissive={hot ? "#bef264" : "#000000"} emissiveIntensity={hot ? 0.5 : 0} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[p.cx, p.cy, p.h + 0.006]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial map={tex} transparent opacity={hot ? 1 : 0.8} />
      </mesh>
    </>
  );
}
function Cadastre() {
  const group = useRef();
  const ring = useRef();
  const drag = useRef(false);
  const off = useRef(0);
  const tex = useMemo(() => cardTexture(), []);
  const hot = PLOTS[HOT];
  useFrame((st, d) => {
    if (!drag.current) off.current *= Math.exp(-d * 1.5);
    group.current.rotation.y = 0.5 + off.current + Math.sin(st.clock.elapsedTime * 0.35) * 0.15;
    const ph = (st.clock.elapsedTime * 0.8) % 1;
    ring.current.scale.setScalar(1 + ph * 0.7);
    ring.current.material.opacity = 0.9 * (1 - ph);
  });
  return (
    <group rotation={[0.8, 0, 0]}>
      <group
        ref={group}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "grab"; }}
        onPointerOut={() => { drag.current = false; document.body.style.cursor = ""; }}
        onPointerDown={(e) => { e.stopPropagation(); drag.current = true; e.target.setPointerCapture(e.pointerId); document.body.style.cursor = "grabbing"; }}
        onPointerMove={(e) => { if (drag.current) off.current = THREE.MathUtils.clamp(off.current + e.nativeEvent.movementX * 0.01, -1.1, 1.1); }}
        onPointerUp={(e) => { drag.current = false; e.target.releasePointerCapture(e.pointerId); document.body.style.cursor = "grab"; }}
      >
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[4.1, 0.08, 4.1]} />
          <meshStandardMaterial color="#052e2b" roughness={0.7} />
        </mesh>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {PLOTS.map((p, i) => <Plot key={p.label} p={p} i={i} hot={i === HOT} />)}
        </group>
        <mesh ref={ring} position={[hot.cx, hot.h + 0.02, -hot.cy]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.02, 8, 48]} />
          <meshBasicMaterial color="#bef264" transparent />
        </mesh>
        <mesh position={[hot.cx, 0.9, -hot.cy]}>
          <cylinderGeometry args={[0.012, 0.012, 1.6, 8]} />
          <meshBasicMaterial color="#bef264" />
        </mesh>
        <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.8}>
          <mesh position={[hot.cx, 2, -hot.cy]} rotation={[-0.8, 0, 0]}>
            <planeGeometry args={[1, 1.25]} />
            <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
          </mesh>
        </Float>
      </group>
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
        <Cadastre />
      </group>
      <Particles count={small ? 90 : 220} />
    </Canvas>
  );
}
