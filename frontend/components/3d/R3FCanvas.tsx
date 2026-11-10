'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Grid } from '@react-three/drei';
import { Badge } from '@/components/ui/badge';
import { Glasses } from 'lucide-react';

interface R3FCanvasProps {
  children?: React.ReactNode;
  enableControls?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function R3FCanvas({
  children,
  enableControls = true,
  showGrid = true,
  className = 'w-full h-full min-h-[500px]',
}: R3FCanvasProps) {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 ${className}`}>
      {/* VR Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <Badge variant="secondary" className="bg-neutral-900/80 backdrop-blur border-neutral-700 text-xs">
          <Glasses className="w-3.5 h-3.5 mr-1 text-primary" />
          R3F / Three.js Virtual Engine Ready
        </Badge>
      </div>

      <Canvas
        camera={{ position: [0, 1.8, 4], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

        <Suspense fallback={null}>
          {showGrid && (
            <Grid
              renderOrder={-1}
              position={[0, -0.01, 0]}
              infiniteGrid
              cellSize={0.5}
              cellThickness={0.6}
              cellColor="#333333"
              sectionSize={2.5}
              sectionThickness={1.2}
              sectionColor="#555555"
              fadeDistance={25}
              fadeStrength={1.5}
            />
          )}

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={10}
            blur={1.5}
            far={4}
          />

          {children}

          {enableControls && (
            <OrbitControls
              makeDefault
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minDistance={1}
              maxDistance={15}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
