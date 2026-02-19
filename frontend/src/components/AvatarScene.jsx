import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ modelUrl }){
  const gltf = useGLTF(modelUrl);
  return <primitive object={gltf.scene} scale={1.2} />;
}

export default function AvatarScene({ modelUrl = "https://models.babylonjs.com/boombox.glb" }){
  return (
    <div style={{ height: 360 }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10,10,10]} />
        <Suspense fallback={null}>
          <Model modelUrl={modelUrl} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
