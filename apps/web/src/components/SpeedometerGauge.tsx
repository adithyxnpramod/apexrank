import React from 'react';
import { mpsToKmh, mpsToMph } from '@apextrack/shared';

interface SpeedometerGaugeProps {
  speedMps: number;
  topSpeedMps: number;
  unit: 'km/h' | 'mph';
  onToggleUnit?: () => void;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speedMps,
  topSpeedMps,
  unit,
  onToggleUnit,
}) => {
  // Convert speed in m/s to the selected UI unit
  const currentSpeed = unit === 'km/h' ? mpsToKmh(speedMps) : mpsToMph(speedMps);
  const peakSpeed = unit === 'km/h' ? mpsToKmh(topSpeedMps) : mpsToMph(topSpeedMps);

  // Maximum gauge scale (e.g. 180 km/h or 120 mph)
  const maxScale = unit === 'km/h' ? 180 : 120;
  const speedClamped = Math.min(Math.max(0, currentSpeed), maxScale);
  const ratio = speedClamped / maxScale;

  // Arc math: 240-degree gauge arc (-210deg to +30deg)
  const radius = 120;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // We only show 240 degrees out of 360 = 240/360 = 0.6667
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength * (1 - ratio);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* SVG Radial Arc Dial */}
      <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-[210deg]"
          viewBox="0 0 300 300"
        >
          {/* Background Track Arc */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="transparent"
            stroke="#161D2F"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Speed Value Arc */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="transparent"
            stroke="url(#speedGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />

          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="65%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
          {/* Main Numeric Readout */}
          <div className="flex items-baseline space-x-1">
            <span className="font-mono font-black text-6xl sm:text-7xl tracking-tighter text-white text-glow">
              {Math.round(currentSpeed)}
            </span>
          </div>

          {/* Unit Toggle Button */}
          <button
            type="button"
            onClick={onToggleUnit}
            className="pointer-events-auto mt-1 px-3 py-1 rounded-full bg-dark-800/80 hover:bg-dark-700 border border-dark-600/80 text-xs font-mono font-bold text-apex-cyan uppercase tracking-wider transition-colors"
            title="Click to switch between km/h and mph"
          >
            {unit} ⇄
          </button>

          {/* Peak Speed Indicator */}
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-apex-gold animate-pulse"></span>
            <span>TOP:</span>
            <span className="text-slate-200 font-bold">
              {peakSpeed.toFixed(1)} {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
