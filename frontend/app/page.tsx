'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OpeningPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl mx-auto text-center space-y-10">
        {/* Simple Website Identity */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 border border-border px-3 py-1 bg-white">
            <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block" />
            <span className="text-[11px] uppercase tracking-widest text-secondary font-medium">
              Augmented Reality Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground">
            SMC <span className="font-semibold text-primary">Doors & Windows</span>
          </h1>

          <p className="text-sm sm:text-base text-secondary max-w-md mx-auto leading-relaxed">
            Architectural 3D door and window models rendered with true physical scale in Augmented Reality.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="gold" size="lg" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/login">Log In</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px]">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
