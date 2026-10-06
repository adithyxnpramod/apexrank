import React, { useState } from 'react';
import { WeeklyActivityDay } from '../api/types';

interface WeeklyMileageChartProps {
  days: WeeklyActivityDay[];
  unit?: 'km' | 'mi';
  className?: string;
}

export const WeeklyMileageChart: React.FC<WeeklyMileageChartProps> = ({
  days,
  unit = 'km',
  className = 'w-full h-64 sm:h-72',
}) => {
  const [hoveredDay, setHoveredDay] = useState<WeeklyActivityDay | null>(null);

  if (!days || days.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center font-mono text-xs text-slate-500">
        No weekly telemetry data available
      </div>
    );
  }

  const maxDistance = Math.max(...days.map((d) => d.distanceKm), 10);
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Calculate coordinates for points
  const points = days.map((d, index) => {
    const x = paddingX + (index / (days.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.distanceKm / maxDistance) * (height - 2 * paddingY);
    return { x, y, day: d };
  });

  // Construct smooth SVG cubic path
  const linePath = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[index - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  // Construct closed area path
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;

  return (
    <div className={`relative flex flex-col justify-between ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mileage-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#7000FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0B0F17" stopOpacity="0.0" />
          </linearGradient>

          <filter id="curve-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Guide Reticles */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
          return (
            <line
              key={`guide-${ratio}`}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#mileage-area-gradient)" />

        {/* Glowing Telemetry Curve */}
        <path
          d={linePath}
          fill="none"
          stroke="#00F0FF"
          strokeWidth="3"
          filter="url(#curve-glow)"
          strokeLinecap="round"
        />

        {/* Interactive Point Markers */}
        {points.map((pt, index) => {
          const isSelected = hoveredDay?.day === pt.day.day;
          return (
            <g
              key={`point-${index}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDay(pt.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Outer Pulse Ring when hovered */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="10"
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}

              {/* Point Core */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 6 : 4}
                fill={isSelected ? '#00F0FF' : '#0B0F17'}
                stroke="#00F0FF"
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* Day Label on X Axis */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={`font-mono text-[11px] font-bold ${
                  isSelected ? 'fill-apex-cyan' : 'fill-slate-400'
                }`}
              >
                {pt.day.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Dynamic Hover Details HUD */}
      {hoveredDay ? (
        <div className="mt-2 px-4 py-2.5 rounded-xl bg-dark-900/95 backdrop-blur-md border border-dark-700/80 shadow-xl flex items-center justify-between text-xs font-mono animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apex-cyan" />
            <span className="font-bold text-white">
              {hoveredDay.day} ({hoveredDay.date})
            </span>
            <span className="text-slate-400">• {hoveredDay.trips} sessions</span>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400">Distance: </span>
              <span className="font-bold text-apex-cyan">
                {unit === 'km'
                  ? `${hoveredDay.distanceKm.toFixed(1)} km`
                  : `${(hoveredDay.distanceKm * 0.621371).toFixed(1)} mi`}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Peak Speed: </span>
              <span className="font-bold text-apex-coral">
                {unit === 'km'
                  ? `${hoveredDay.peakSpeedKmh.toFixed(1)} km/h`
                  : `${(hoveredDay.peakSpeedKmh * 0.621371).toFixed(1)} mph`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 px-4 py-2 text-center text-xs font-mono text-slate-500">
          Hover over daily telemetry nodes to view session distance, peak speed & pace
        </div>
      )}
    </div>
  );
};
