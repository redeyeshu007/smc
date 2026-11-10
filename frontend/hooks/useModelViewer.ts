'use client';

import { useEffect, useState, useRef } from 'react';

export function useModelViewer() {
  const [isReady, setIsReady] = useState(false);
  const modelViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Dynamically import @google/model-viewer on the browser
    import('@google/model-viewer')
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error('Failed to load Google Model Viewer:', err);
      });
  }, []);

  const triggerAR = () => {
    if (modelViewerRef.current && 'activateAR' in modelViewerRef.current) {
      (modelViewerRef.current as any).activateAR();
    }
  };

  return {
    isReady,
    modelViewerRef,
    triggerAR,
  };
}
