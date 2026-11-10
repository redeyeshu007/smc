'use client';

import React from 'react';
import { R3FCanvas } from '@/components/3d/R3FCanvas';
import { useShowroomStore } from '@/stores/useShowroomStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Glasses, Sun, Moon, Sunset, Compass } from 'lucide-react';

export default function VRShowroomPage() {
  const { lightingMood, setLightingMood, setCameraView } = useShowroomStore();

  return (
    <div className="container max-w-7xl px-4 sm:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">VR Virtual Showroom</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immersive 3D architectural gallery powered by Three.js, React Three Fiber, @react-three/drei, and WebXR.
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto border-primary/40 text-primary">
          <Glasses className="w-3.5 h-3.5 mr-1" />
          WebXR Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main 3D Canvas */}
        <div className="lg:col-span-3">
          <R3FCanvas showGrid enableControls className="w-full h-[560px]" />
        </div>

        {/* Showroom Interactive Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" />
                Lighting & Environment Mood
              </CardTitle>
              <CardDescription className="text-xs">
                Simulate sun angles & day/night lighting on architectural glass & aluminum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={lightingMood === 'daylight' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setLightingMood('daylight')}
              >
                <Sun className="w-3.5 h-3.5 mr-2 text-amber-500" />
                Natural Daylight (5500K)
              </Button>
              <Button
                variant={lightingMood === 'sunset' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setLightingMood('sunset')}
              >
                <Sunset className="w-3.5 h-3.5 mr-2 text-orange-500" />
                Golden Hour Sunset (3200K)
              </Button>
              <Button
                variant={lightingMood === 'night' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setLightingMood('night')}
              >
                <Moon className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Interior Evening Mood
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                Camera Angles
              </CardTitle>
              <CardDescription className="text-xs">
                Architectural camera presets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setCameraView([0, 1.8, 4], [0, 1.2, 0])}
              >
                Front Eye-Level Elevation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setCameraView([3, 2.5, 3], [0, 1.0, 0])}
              >
                Perspective Isometric View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setCameraView([0, 0.8, 1.5], [0, 0.8, 0])}
              >
                Hardware Close-up View
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
