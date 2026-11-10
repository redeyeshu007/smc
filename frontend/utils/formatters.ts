export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDimension = (mm: number, targetUnit: 'mm' | 'inches' = 'mm'): string => {
  if (targetUnit === 'inches') {
    const inches = (mm / 25.4).toFixed(1);
    return `${inches}"`;
  }
  return `${mm} mm`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatPolycount = (count?: number): string => {
  if (!count) return 'N/A';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M tris`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k tris`;
  }
  return `${count} tris`;
};

