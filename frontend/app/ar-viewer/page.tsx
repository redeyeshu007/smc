'use client';

import React from 'react';
import { ModelViewerCanvas } from '@/components/3d/ModelViewerCanvas';
import { useARCapabilities } from '@/hooks/useARCapabilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, Smartphone } from 'lucide-react';

export default function ARViewerPage() {
  const capabilities = useARCapabilities();

  return (
    <div className="container max-w-7xl px-4 sm:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AR Integration Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Google Model Viewer with cross-platform Augmented Reality pipeline for iOS (Quick Look USDZ) and Android (Scene Viewer GLB).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3D / AR Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <ModelViewerCanvas
            autoRotate
            cameraControls
            ar
            arPlacement="wall"
            className="w-full h-[520px] rounded-xl shadow-inner"
          />
          <p className="text-xs text-muted-foreground">
            * Active viewer supports GLB / GLTF 2.0 binary models with PBR materials and USDZ fallback for Safari iOS Quick Look.
          </p>
        </div>

        {/* AR Capabilities & Pipeline Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Device AR Capabilities
              </CardTitle>
              <CardDescription className="text-xs">
                Detected runtime capabilities on current browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border">
                <span className="font-medium">WebXR Immersive AR</span>
                <Badge variant={capabilities.supportsWebXR ? 'success' : 'secondary'} className="text-[10px]">
                  {capabilities.supportsWebXR ? 'Supported' : 'Unavailable on Desktop'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border">
                <span className="font-medium">Apple ARKit (Quick Look)</span>
                <Badge variant={capabilities.supportsQuickLook ? 'success' : 'secondary'} className="text-[10px]">
                  {capabilities.supportsQuickLook ? 'Supported (iOS)' : 'iOS Safari Only'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border">
                <span className="font-medium">Google ARCore (Scene Viewer)</span>
                <Badge variant={capabilities.supportsSceneViewer ? 'success' : 'secondary'} className="text-[10px]">
                  {capabilities.supportsSceneViewer ? 'Supported (Android)' : 'Android Chrome Only'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Box className="w-4 h-4 text-primary" />
                Asset Format Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="border rounded-lg p-3 space-y-1">
                <div className="font-semibold text-foreground">Primary Format: GLB / GLTF 2.0</div>
                <p className="text-muted-foreground">
                  Embedded binary with Draco compression, PBR metallic-roughness materials, and normalized origin for wall-mount placement.
                </p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <div className="font-semibold text-foreground">Apple Format: USDZ</div>
                <p className="text-muted-foreground">
                  Universal Scene Description archive converted for native zero-app-install iOS Quick Look AR visualization.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
