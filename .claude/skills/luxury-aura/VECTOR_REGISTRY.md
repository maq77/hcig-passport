# VAULT: High-Precision Lightweight Vector Registries

## Scope: Zero-Weight Custom Inline SVG Components (Flyweight Pattern)

Replace all keyboard shortcuts, emojis, and external font packages with these performance-optimized, hairline structural vector blocks.

```tsx
import React from 'react';

interface VectorProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// 1. Location Vector (Architectural Crosshair Pin)
export const EliteLocationIcon = ({ className = "w-4 h-4", ...props }: VectorProps) => (
  <svg className={`${className} stroke-current transition-transform duration-[1500ms] cubic-bezier(0.16,1,0.3,1) group-hover:rotate-90`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

// 2. Precision Caliper Vector (Geometric Standard Marker)
export const EliteScaleIcon = ({ className = "w-4 h-4", ...props }: VectorProps) => (
  <svg className={`${className} stroke-current`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="19" x2="19" y2="19" />
    <line x1="12" y1="5" x2="12" y2="19" />
    <path d="M5 9l7-4 7 4" />
  </svg>
);

// 3. Facet Jewel Vector (Authentic Quality Diamond Asset)
export const PremiumFacetIcon = ({ className = "w-4 h-4", ...props }: VectorProps) => (
  <svg className={`${className} stroke-current`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2L2 9l10 13 10-13L12 2z" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

// 4. Prestige Directive Pointer (Smooth Action Arrow Vector)
export const WorldClassArrow = ({ className = "w-4 h-4", ...props }: VectorProps) => (
  <svg className={`${className} stroke-current transform transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="2" y1="12" x2="22" y2="12" />
    <polyline points="14 4 22 12 14 20" />
  </svg>
);
```
