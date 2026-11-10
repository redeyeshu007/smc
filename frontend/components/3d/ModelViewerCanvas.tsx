'use client';

import React, { useRef } from 'react';
import { useModelViewer } from '@/hooks/useModelViewer';

interface ModelViewerCanvasProps {
  src?: string;
  iosSrc?: string;
  alt?: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  arModes?: string;
  arPlacement?: 'floor' | 'wall';
  className?: string;
}

export function ModelViewerCanvas({
  src,
  iosSrc,
  alt = 'Architectural 3D Model',
  poster,
  autoRotate = false,
  cameraControls = true,
  ar = true,
  arModes = 'webxr scene-viewer quick-look',
  arPlacement = 'wall',
  className = 'w-full h-[520px]',
}: ModelViewerCanvasProps) {
  const { isReady, modelViewerRef } = useModelViewer();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative border border-border bg-white flex items-center justify-center overflow-hidden ${className}`}
    >
      {!isReady ? (
        <div className="flex flex-col items-center justify-center p-8 text-secondary space-y-2">
          <span className="text-xs tracking-wider uppercase">Loading 3D Engine...</span>
        </div>
      ) : !src ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-primary font-medium">3D Viewport</span>
          <p className="text-sm font-medium text-foreground">Interactive 3D Model Ingestion Ready</p>
          <p className="text-xs text-secondary max-w-sm">
            Select a published door or window to inspect the 3D model and launch Augmented Reality.
          </p>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {React.createElement('model-viewer', {
            ref: modelViewerRef,
            src,
            'ios-src': iosSrc,
            alt,
            poster,
            'auto-rotate': autoRotate ? '' : undefined,
            'camera-controls': cameraControls ? '' : undefined,
            ar: ar ? '' : undefined,
            'ar-modes': arModes,
            'ar-placement': arPlacement,
            'shadow-intensity': '0.8',
            'exposure': '1.0',
            style: { width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
          })}
        </div>
      )}
    </div>
  );
}
