'use client';

import React from 'react';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';

export function MaterialSelector() {
  const { currentProduct, selectedMaterial, setMaterial } = useConfiguratorStore();

  if (!currentProduct || !currentProduct.customizable) return null;

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-card">
      <h4 className="text-sm font-semibold tracking-tight">Frame Finishes & Materials</h4>

      <div className="grid grid-cols-2 gap-2">
        {currentProduct.customizable.materials.map((mat) => {
          const isSelected = selectedMaterial?.code === mat.code;
          return (
            <button
              key={mat.code}
              type="button"
              onClick={() => setMaterial(mat)}
              className={cn(
                'flex items-center space-x-2.5 p-2 rounded-md border text-left text-xs transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <span
                className="w-5 h-5 rounded-full border shadow-inner flex-shrink-0"
                style={{ backgroundColor: mat.hexColor }}
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{mat.name}</span>
                {mat.priceModifier > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{formatCurrency(mat.priceModifier)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

