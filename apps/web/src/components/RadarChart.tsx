import React, { useState } from 'react';

export interface RadarAxis {
  label: string;
  valueA: number; // 0 - 100
  valueB: number; // 0 - 100
  rawValueA: string;
  rawValueB: string;
  winner: 'A' | 'B' | 'TIE';
}

interface RadarChartProps {
  axes: RadarAxis[];
  driverAName: string;
  driverBName: string;
  className?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  driverAName,
  driverBName,
  className = 'w-full h-80 sm:h-96',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 130;
  const n = axes.length;

  // Calculate coordinates for a given axis index and normalized value (0 - 100)
  const getCoordinates = (index: number, val: number) => {
    const angle = (index * 2 * Math.PI) / n - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Label coordinates (positioned slightly beyond outer ring)
  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / n - Math.PI / 2;
    const r = radius + 32;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Build polygon points string
  const pointsA = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.valueA);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const pointsB = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.valueB);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Grid concentric polygon levels (33%, 66%, 100%)
  const gridLevels = [0.33, 0.66, 1.0];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full max-w-[420px] max-h-[420px] overflow-visible"
      >
        <defs>
          {/* Laser Glow Filters */}
          <filter id="radar-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="radar-glow-violet" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="cyan-polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="violet-polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7000FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Concentric Spider Reticles */}
        {gridLevels.map((level, lvlIdx) => {
          const gridPoints = axes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level * 100);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <polygon
              key={`grid-${lvlIdx}`}
              points={gridPoints}
              fill={lvlIdx === 2 ? '#0B0F17' : 'none'}
              fillOpacity={0.6}
              stroke="rgba(0, 240, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray={lvlIdx < 2 ? '3 3' : undefined}
            />
          );
        })}

        {/* Spoke Radial Lines */}
        {axes.map((_, i) => {
          const outer = getCoordinates(i, 100);
          return (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Driver B Polygon (Violet) */}
        <polygon
          points={pointsB}
          fill="url(#violet-polygon-grad)"
          stroke="#7000FF"
          strokeWidth="2.5"
          filter="url(#radar-glow-violet)"
          className="transition-all duration-500 ease-out"
        />

        {/* Driver A Polygon (Cyan) */}
        <polygon
          points={pointsA}
          fill="url(#cyan-polygon-grad)"
          stroke="#00F0FF"
          strokeWidth="2.5"
          filter="url(#radar-glow-cyan)"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Markers & Interactive Hitboxes */}
        {axes.map((axis, i) => {
          const coordA = getCoordinates(i, axis.valueA);
          const coordB = getCoordinates(i, axis.valueB);
          const isHovered = hoveredIndex === i;

          return (
            <g key={`vertex-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {/* Driver B Vertex Dot */}
              <circle
                cx={coordB.x}
                cy={coordB.y}
                r={isHovered ? 6 : 4}
                fill="#7000FF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="transition-all duration-200"
              />

              {/* Driver A Vertex Dot */}
              <circle
                cx={coordA.x}
                cy={coordA.y}
                r={isHovered ? 6 : 4}
                fill="#00F0FF"
                stroke="#0B0F17"
                strokeWidth="2"
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* Axis Labels Around Perimeter */}
        {axes.map((axis, i) => {
          const { x, y } = getLabelCoordinates(i);
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={`label-${i}`}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-mono text-[11px] font-bold tracking-wider transition-all duration-200 ${
                  isHovered
                    ? 'fill-white text-[12px]'
                    : axis.winner === 'A'
                    ? 'fill-apex-cyan'
                    : axis.winner === 'B'
                    ? 'fill-apex-violet'
                    : 'fill-slate-400'
                }`}
              >
                {axis.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Dynamic Hover Tooltip / Selected Metric Indicator */}
      {hoveredIndex !== null && (
        <div className="absolute bottom-2 z-20 px-3.5 py-1.5 rounded-xl bg-dark-900/95 backdrop-blur-md border border-dark-700 shadow-2xl flex items-center space-x-4 text-xs font-mono animate-fadeIn">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-apex-cyan" />
            <span className="text-slate-300">{driverAName}:</span>
            <span className="font-bold text-white">{axes[hoveredIndex].rawValueA}</span>
          </div>
          <div className="text-slate-500 font-bold">vs</div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-apex-violet" />
            <span className="text-slate-300">{driverBName}:</span>
            <span className="font-bold text-white">{axes[hoveredIndex].rawValueB}</span>
          </div>
        </div>
      )}
    </div>
  );
};
