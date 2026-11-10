'use client';

import React from 'react';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';
import { formatDimension } from '@/utils/formatters';

export function DimensionInputs() {
  const { currentProduct, selectedWidth, selectedHeight, setWidth, setHeight } =
    useConfiguratorStore();

  if (!currentProduct) return null;

  const { widthRange, heightRange } = currentProduct.customizable;

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-card">
      <h4 className="text-sm font-semibold tracking-tight">Dimensions (Custom Sizing)</h4>

      {/* Width Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Width</span>
          <span className="font-semibold">{formatDimension(selectedWidth)}</span>
        </div>
        <input
          type="range"
          min={widthRange.min}
          max={widthRange.max}
          step={50}
          value={selectedWidth}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{widthRange.min} mm</span>
          <span>{widthRange.max} mm</span>
        </div>
      </div>

      {/* Height Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Height</span>
          <span className="font-semibold">{formatDimension(selectedHeight)}</span>
        </div>
        <input
          type="range"
          min={heightRange.min}
          max={heightRange.max}
          step={50}
          value={selectedHeight}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{heightRange.min} mm</span>
          <span>{heightRange.max} mm</span>
        </div>
      </div>
    </div>
  );
}
