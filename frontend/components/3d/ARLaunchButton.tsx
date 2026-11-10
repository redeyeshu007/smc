'use client';

import React from 'react';
import { useARCapabilities } from '@/hooks/useARCapabilities';
import { buildSceneViewerUrl } from '@/utils/3d-helpers';
import { Button, ButtonProps } from '@/components/ui/button';
import { Box, Sparkles } from 'lucide-react';

interface ARLaunchButtonProps extends ButtonProps {
  glbUrl: string;
  usdzUrl?: string;
  title: string;
}

export function ARLaunchButton({
  glbUrl,
  usdzUrl,
  title,
  className,
  ...props
}: ARLaunchButtonProps) {
  const { supportsQuickLook, supportsSceneViewer } = useARCapabilities();

  const handleLaunch = () => {
    // 1. Apple iOS Quick Look
    if (supportsQuickLook && usdzUrl) {
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', usdzUrl);
      anchor.appendChild(document.createElement('img'));
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    // 2. Android Scene Viewer intent
    if (supportsSceneViewer && glbUrl) {
      const intentUrl = buildSceneViewerUrl(glbUrl, title, window.location.href);
      window.location.href = intentUrl;
      return;
    }

    // 3. Desktop / WebXR fallback
    alert('AR View requires a mobile device with ARCore (Android) or ARKit (iOS). Open this page on your phone!');
  };

  return (
    <Button
      onClick={handleLaunch}
      className={className}
      {...props}
    >
      <Box className="w-4 h-4 mr-2" />
      <span>View in AR</span>
      <Sparkles className="w-3.5 h-3.5 ml-1.5 opacity-70" />
    </Button>
  );
}
