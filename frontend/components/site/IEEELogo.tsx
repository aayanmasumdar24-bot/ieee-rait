import React from 'react';

interface IEEELogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  variant?: 'blue' | 'white' | 'brand' | 'card';
}

export function IEEELogo({ className = '', height = 40, width, variant = 'white' }: IEEELogoProps) {
  const isBlue = variant === 'blue' || variant === 'brand';
  const primaryColor = isBlue ? '#0072CE' : '#FFFFFF';

  const svg = (
    <svg
      viewBox="0 0 600 180"
      height={height}
      width={width}
      className={`shrink-0 transition-all ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="IEEE Official Logo"
    >
      {/* Outer Diamond Rhombus */}
      <polygon points="90,10 170,90 90,170 10,90" fill={primaryColor} />
      
      {/* Diamond Inner Core Emblem (Arrow & Right-Hand Rule Flux) */}
      <g fill={isBlue ? '#FFFFFF' : '#05070d'}>
        {/* Central Upward Arrow Shaft */}
        <rect x="85" y="60" width="10" height="68" rx="2" />
        {/* Arrow Head */}
        <polygon points="90,40 106,68 74,68" />
        
        {/* Flux loop arc circling the arrow */}
        <path
          d="M 50,96 C 50,82 130,82 130,96 C 130,108 58,108 58,98 L 66,98 C 66,103 122,103 122,96 C 122,87 58,87 58,96 Z"
        />
        {/* Loop Arrow head */}
        <polygon points="126,88 138,98 124,103" />
      </g>

      {/* Letter: I */}
      <rect x="200" y="40" width="34" height="100" rx="3" fill={primaryColor} />

      {/* Letter: First E */}
      <g transform="translate(258, 40)" fill={primaryColor}>
        <rect x="0" y="0" width="30" height="100" rx="3" />
        <rect x="20" y="0" width="62" height="24" rx="2" />
        <rect x="20" y="38" width="52" height="22" rx="2" />
        <rect x="20" y="76" width="62" height="24" rx="2" />
      </g>

      {/* Letter: Second E */}
      <g transform="translate(366, 40)" fill={primaryColor}>
        <rect x="0" y="0" width="30" height="100" rx="3" />
        <rect x="20" y="0" width="62" height="24" rx="2" />
        <rect x="20" y="38" width="52" height="22" rx="2" />
        <rect x="20" y="76" width="62" height="24" rx="2" />
      </g>

      {/* Letter: Third E */}
      <g transform="translate(474, 40)" fill={primaryColor}>
        <rect x="0" y="0" width="30" height="100" rx="3" />
        <rect x="20" y="0" width="62" height="24" rx="2" />
        <rect x="20" y="38" width="52" height="22" rx="2" />
        <rect x="20" y="76" width="62" height="24" rx="2" />
      </g>

      {/* Registered trademark circle ® */}
      <circle cx="120" cy="150" r="8" fill="none" stroke={primaryColor} strokeWidth="2" />
      <text x="120" y="153" fontSize="10" fill={primaryColor} textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">R</text>
    </svg>
  );

  if (variant === 'card') {
    return (
      <div className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/95 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform duration-200 hover:scale-105">
        <IEEELogo height={height} variant="brand" />
      </div>
    );
  }

  return svg;
}
