import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 py-8">
      <div className="container max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">
            SMC AR/VR Door & Window Architectural Platform
          </p>
          <p>Next.js 15 App Router • React 19 • Three.js • WebXR • Node/Express • MongoDB</p>
        </div>
        <div className="flex items-center space-x-4">
          <span>Google Model Viewer</span>
          <span>•</span>
          <span>Apple ARKit USDZ</span>
          <span>•</span>
          <span>Android ARCore</span>
          <span>•</span>
          <span>R2 / S3 Storage</span>
        </div>
      </div>
    </footer>
  );
}

