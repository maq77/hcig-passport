# INTERACTION: Modern Sensory Interfaces & Atmospheric Code Modules

## Scope: Production-Ready Glassmorphic Physics Templates

This reference module houses functional, production-ready interfaces mapping Apple’s fluid desktop layer laws over high-end fashion editorial structures.

---

### 1. The Liquid Glass Magnetic Interactive Card (Atmospheric Bento Spec)
```tsx
import React, { useRef, useState } from 'react';
import { PremiumFacetIcon } from './vector-registry';

interface LiquidGlassCardProps {
  label: string;
  title: string;
  focus: string;
  description: string;
}

export function LiquidGlassCard({ label, title, focus, description }: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // PHYSICS LAYER: Smooth 3D Inertial Calculation
    const rotateX = ((y - centerY) / centerY) * -8; // Restricted max 8deg rotational axis
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotateX, y: rotateY });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setOpacity(0);
  };

  return (
    <div className="w-full max-w-sm style-layer transition-transform duration-700 ease-out">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="relative h-[480px] w-full rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden group cursor-pointer"
      >
        {/* The Ambiance Tracking Light Beam */}
        <div 
          className="pointer-events-none absolute -inset-px transition-opacity duration-700"
          style={{
            opacity,
            background: `radial-gradient(500px circle at ${rotate.y * 12 + 50}% ${rotate.x * -12 + 50}%, rgba(255,255,255,0.12), transparent 45%)`
          }}
        />

        {/* Content Structure Layer */}
        <div className="relative h-full p-10 flex flex-col justify-between z-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-[0.35em] text-white/40 font-medium">{label}</span>
              <PremiumFacetIcon className="w-4 h-4 text-white/30 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-serif font-thin tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 leading-tight">
              {title}
            </h3>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-light leading-relaxed text-white/60">
              {description}
            </p>
            <div className="pt-4 flex justify-between items-center text-[9px] uppercase tracking-[0.3em] text-white/40 border-t border-white/5">
              <span>Target: <strong className="text-white/80 font-medium">{focus}</strong></span>
              <span className="font-mono text-white/20">Layer 01 //</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
