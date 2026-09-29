"use client";

import React, { useRef, useState } from 'react';

// The PremiumFacetIcon from VECTOR_REGISTRY.md (copied here for the client component)
const PremiumFacetIcon = ({ className = "w-4 h-4", ...props }: any) => (
  <svg className={`${className} stroke-current`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2L2 9l10 13 10-13L12 2z" /><line x1="2" y1="9" x2="22" y2="9" /><line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);
const WorldClassArrow = ({ className = "w-4 h-4", ...props }: any) => (
  <svg className={`${className} stroke-current transform transition-transform duration-1000 group-hover:translate-x-3`} viewBox="0 0 24 24" fill="none" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="2" y1="12" x2="22" y2="12" /><polyline points="14 4 22 12 14 20" />
  </svg>
);

export function LiquidServiceCard({ it, index }: { it: any, index: number }) {
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
    const rotateX = ((y - centerY) / centerY) * -6; 
    const rotateY = ((x - centerX) / centerX) * 6;
    setRotate({ x: rotateX, y: rotateY });
    setOpacity(1);
  };
  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setOpacity(0);
  };

  return (
    <div className="w-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ perspective: '1200px' }}>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="relative h-[480px] w-full rounded-none border border-stone-200/60 bg-white/40 backdrop-blur-3xl shadow-sm hover:shadow-2xl overflow-hidden group cursor-pointer"
      >
        <div 
          className="pointer-events-none absolute -inset-px transition-opacity duration-1000 z-0"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${rotate.y * 12 + 50}% ${rotate.x * -12 + 50}%, rgba(255,255,255,1), transparent 50%)`
          }}
        />
        <div className="relative h-full p-12 flex flex-col justify-between z-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-200/50 pb-6">
              <span className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">Treatment 0{index + 1}</span>
              <PremiumFacetIcon className="w-4 h-4 text-stone-300 group-hover:text-[#8B0016] transition-colors duration-700" />
            </div>
            <h3 className="text-3xl font-serif font-light tracking-wide text-stone-900 leading-[1.1]">
              {it.title}
            </h3>
          </div>
          <div className="space-y-8">
            <p className="text-xs font-light leading-loose text-stone-500">
              {it.text || "Exclusive diagnostic protocols designed for structural health and total privacy."}
            </p>
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] font-bold text-stone-900 group-hover:text-[#8B0016] transition-colors duration-700">
              <span>Explore</span>
              <WorldClassArrow className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
