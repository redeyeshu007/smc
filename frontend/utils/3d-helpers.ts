export interface ARCapabilities {
  supportsWebXR: boolean;
  supportsQuickLook: boolean; // iOS ARKit
  supportsSceneViewer: boolean; // Android ARCore
}

export const checkARCapabilities = (): ARCapabilities => {
  if (typeof window === 'undefined') {
    return {
      supportsWebXR: false,
      supportsQuickLook: false,
      supportsSceneViewer: false,
    };
  }

  const userAgent = navigator.userAgent || navigator.vendor;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /android/i.test(userAgent);

  // iOS QuickLook support: check if anchor element supports rel=ar
  const a = document.createElement('a');
  const supportsQuickLook = isIOS && a.relList && a.relList.supports && a.relList.supports('ar');

  const supportsWebXR = 'xr' in navigator;

  return {
    supportsWebXR,
    supportsQuickLook: Boolean(supportsQuickLook),
    supportsSceneViewer: isAndroid,
  };
};

/**
 * Generates an intent URI for Android Scene Viewer AR
 */
export const buildSceneViewerUrl = (
  glbUrl: string,
  title: string,
  linkUrl: string
): string => {
  const encodedModelUrl = encodeURIComponent(glbUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedLink = encodeURIComponent(linkUrl);

  return `intent://arvr.google.com/scene-viewer/1.0?file=${encodedModelUrl}&mode=ar_preferred&title=${encodedTitle}&link=${encodedLink}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodedModelUrl};end;`;
};

/**
 * Normalizes dimension input (meters for 3D engine vs mm for manufacture)
 */
export const mmToMeters = (mm: number): number => mm / 1000;
export const metersToMm = (meters: number): number => meters * 1000;
