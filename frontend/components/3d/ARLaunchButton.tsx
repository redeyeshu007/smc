'use client';

import React from 'react';
import { useARCapabilities } from '@/hooks/useARCapabilities';
import { buildSceneViewerUrl } from '@/utils/3d-helpers';
import { Button, ButtonProps } from '@/components/ui/button';

interface ARLaunchButtonProps extends ButtonProps {
  glbUrl?: string;
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

    // 3. Desktop / Browser notification
    alert(
      'To experience Augmented Reality on your wall, open this page on an ARCore (Android) or ARKit (iPhone/iPad) mobile device.'
    );
  };

  return (
    <Button
      variant="gold"
      size="lg"
      onClick={handleLaunch}
      className={`tracking-wider uppercase text-xs font-semibold ${className}`}
      {...props}
    >
      View in AR
    </Button>
  );
}
