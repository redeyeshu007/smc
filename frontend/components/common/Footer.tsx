import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-8 mt-auto">
      <div className="container max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-foreground tracking-wide">SMC</span>
          <span>—</span>
          <span>Augmented Reality Architectural Door & Window System</span>
        </div>
        <div>
          <span>GLB & Apple USDZ Support</span>
        </div>
      </div>
    </footer>
  );
}
