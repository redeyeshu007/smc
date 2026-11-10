'use client';

import { useState, useEffect } from 'react';
import { checkARCapabilities, ARCapabilities } from '@/utils/3d-helpers';

export function useARCapabilities(): ARCapabilities {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    supportsWebXR: false,
    supportsQuickLook: false,
    supportsSceneViewer: false,
  });

  useEffect(() => {
    setCapabilities(checkARCapabilities());
  }, []);

  return capabilities;
}

