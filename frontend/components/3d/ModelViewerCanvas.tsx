'use client';

import React, { useRef } from 'react';
import { useModelViewer } from '@/hooks/useModelViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, View } from 'lucide-react';

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
  alt = '3D Door/Window Model',
  poster,
  autoRotate = false,
  cameraControls = true,
  ar = true,
  arModes = 'webxr scene-viewer quick-look',
  arPlacement = 'wall',
  className = 'w-full h-full min-h-[400px]',
}: ModelViewerCanvasProps) {
  const { isReady, modelViewerRef, triggerAR } = useModelViewer();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center ${className}`}
    >
      {!isReady ? (
        <div className="flex flex-col items-center justify-center p-8 text-neutral-400 space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing 3D Model Viewer engine...</span>
        </div>
      ) : !src ? (
        <div className="flex flex-col items-center justify-center p-8 text-neutral-400 text-center space-y-3">
          <View className="w-12 h-12 text-neutral-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-300">Ready for GLB / USDZ 3D Asset</p>
            <p className="text-xs text-neutral-500">
              Upload a door/window 3D model in Admin or select from catalog
            </p>
          </div>
          <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-xs">
            WebXR • Quick Look • Scene Viewer
          </Badge>
        </div>
      ) : (
        // Standard Web Component representation
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
            'shadow-intensity': '1',
            'exposure': '1',
            style: { width: '100%', height: '100%' },
          })}

          {/* Viewer Overlay Controls */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            {ar && (
              <Button
                size="sm"
                variant="default"
                onClick={triggerAR}
                className="shadow-lg backdrop-blur"
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                View in My Room (AR)
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
