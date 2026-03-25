import React, { Suspense, useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import { audioState } from "../Services/api";

// ─── Jaw overlay: lip meshes that open/close over the model's mouth ────────
// This is a CHILD of the model so it inherits position/rotation/scale
function JawOverlay({ mouthLocalPos }) {
  const groupRef = useRef();
  const upperRef = useRef();
  const lowerRef = useRef();
  const smoothVal = useRef(0);

  // Dark interior ellipse (visible when mouth is open)
  const interiorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.04, 0.008, 0, Math.PI * 2, false);
    return new THREE.ShapeGeometry(shape, 20);
  }, []);
  const interiorMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x080202,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Lip ellipses (slightly wider than interior)
  const lipGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.048, 0.012, 0, Math.PI * 2, false);
    return new THREE.ShapeGeometry(shape, 20);
  }, []);
  const lipMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x1a0606,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  useFrame((_, delta) => {
    let target = audioState?.targetMouth ?? 0;

    // FALLBACK: if speech is active but targetMouth is stuck at 0,
    // generate synthetic oscillating mouth movement
    if (audioState?.isWebSpeech && target < 0.01) {
      const t = Date.now() * 0.006;
      target = 0.3 + Math.sin(t) * 0.25 + Math.sin(t * 2.7) * 0.15;
      target = Math.max(0, Math.min(1, target));
    }

    // Fast open, slow close
    const factor = target > smoothVal.current ? 0.35 : 0.1;
    smoothVal.current = THREE.MathUtils.lerp(smoothVal.current, target, factor);
    const v = smoothVal.current;

    // Separate upper & lower lips
    if (upperRef.current) {
      upperRef.current.position.y = v * 0.012;
    }
    if (lowerRef.current) {
      lowerRef.current.position.y = -v * 0.025;
    }

    // Show interior when open
    interiorMat.opacity = v * 0.85;
    lipMat.opacity = v * 0.35;
  });

  if (!mouthLocalPos) return null;

  return (
    <group ref={groupRef} position={mouthLocalPos}>
      {/* Upper lip */}
      <mesh ref={upperRef} geometry={lipGeo} material={lipMat} position={[0, 0.006, 0.001]} renderOrder={1} />
      {/* Dark mouth interior */}
      <mesh geometry={interiorGeo} material={interiorMat} position={[0, 0, 0]} renderOrder={0} />
      {/* Lower lip */}
      <mesh ref={lowerRef} geometry={lipGeo} material={lipMat} position={[0, -0.006, 0.001]} renderOrder={1} />
    </group>
  );
}

function RealisticInterviewer() {
  const { scene } = useGLTF("/interviewer.glb");
  const texture = useTexture("/pjan.png");
  const modelRef = useRef();
  const timeRef = useRef(0);
  const [mouthPos, setMouthPos] = useState(null);

  // Configure texture
  useEffect(() => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  // Apply texture and detect mouth position
  useEffect(() => {
    if (!scene) return;

    let targetMesh = null;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = texture;
        child.material.needsUpdate = true;
        targetMesh = child;
      }
    });

    if (!targetMesh) return;

    // ─── Detect mouth position from geometry ────────────────────────
    const geo = targetMesh.geometry;
    if (!geo?.attributes?.position) return;

    const posAttr = geo.attributes.position;
    const bbox = new THREE.Box3().setFromBufferAttribute(posAttr);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Find front-most vertices near horizontal center
    let frontVerts = [];
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      if (Math.abs(x - center.x) < size.x * 0.15) {
        frontVerts.push({ y: posAttr.getY(i), z: posAttr.getZ(i) });
      }
    }
    frontVerts.sort((a, b) => b.z - a.z);

    // Mouth area: lower 20-40% of the face, near the front
    const frontZ = frontVerts.length > 0 ? frontVerts[0].z : center.z + size.z * 0.5;
    const lowerBound = center.y - size.y * 0.25;
    const upperBound = center.y - size.y * 0.05;

    const mouthVerts = frontVerts.filter(
      (v) => v.y >= lowerBound && v.y <= upperBound && Math.abs(v.z - frontZ) < size.z * 0.2
    );

    let mouthY, mouthZ;
    if (mouthVerts.length > 0) {
      mouthY = mouthVerts.reduce((s, v) => s + v.y, 0) / mouthVerts.length;
      mouthZ = mouthVerts.reduce((s, v) => s + v.z, 0) / mouthVerts.length;
    } else {
      // Fallback: estimated position
      mouthY = center.y - size.y * 0.12;
      mouthZ = frontZ;
    }

    // Set mouth position in model's LOCAL space
    // Push slightly in front of the surface to avoid z-fighting
    setMouthPos([center.x, mouthY, mouthZ + 0.005]);
  }, [scene, texture]);

  // ─── Animation loop ─────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!scene || !modelRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Subtle breathing
    const breathe = 1.0 + Math.sin(t * 1.2) * 0.002;
    modelRef.current.scale.setScalar(1.1 * breathe);
  });

  return (
    <group>
      <primitive
        ref={modelRef}
        object={scene}
        scale={1.1}
        position={[0.4, -2, 1]}
        rotation={[0, -Math.PI / 2.1, 0]}
      >
        {/* JawOverlay is a CHILD of the model — inherits all transforms */}
        {mouthPos && <JawOverlay mouthLocalPos={mouthPos} />}
      </primitive>
    </group>
  );
}

// ─── Speaking indicator ─────────────────────────────────────────────────
function SpeakingBadge() {
  const divRef = useRef();
  useFrame(() => {
    if (divRef.current) {
      divRef.current.style.display = audioState?.isWebSpeech ? "flex" : "none";
    }
  });

  return (
    <Html position={[0.4, 0.8, 1]} center>
      <div ref={divRef} className="speaking-badge" style={{ display: "none" }}>
        <span className="speaking-dot" />
        Speaking...
      </div>
    </Html>
  );
}

export default function AvatarScene() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative"
      style={{
        height: "450px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* Warm key + cool fill + rim */}
        <ambientLight intensity={0.5} color="#e2e8f0" />
        <directionalLight position={[5, 8, 10]} intensity={3} castShadow color="#fef3c7" />
        <spotLight position={[-3, 6, 8]} angle={0.4} penumbra={1} intensity={1.5} color="#93c5fd" />
        <pointLight position={[0, 3, -5]} intensity={0.8} color="#818cf8" />

        <Suspense
          fallback={
            <Html center>
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading Interviewer...
              </div>
            </Html>
          }
        >
          <RealisticInterviewer />
          
          <ContactShadows position={[0, -6, 0]} opacity={0.3} scale={20} blur={2.5} far={10} />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </div>
  );
}