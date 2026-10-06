import React, { useState } from 'react';
import { Car, Check, ChevronDown, Cpu, Gauge, Wrench, Zap } from 'lucide-react';
import { VehicleRecord } from '../api/types';

interface VehicleGarageCardProps {
  vehicles: VehicleRecord[];
  activeVehicle: VehicleRecord;
  onSelectVehicle?: (vehicle: VehicleRecord) => void;
  className?: string;
}

export const VehicleGarageCard: React.FC<VehicleGarageCardProps> = ({
  vehicles,
  activeVehicle: initialActive,
  onSelectVehicle,
  className = '',
}) => {
  const [active, setActive] = useState<VehicleRecord>(initialActive);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (v: VehicleRecord) => {
    setActive(v);
    setIsDropdownOpen(false);
    onSelectVehicle?.(v);
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 border border-dark-700/80 relative overflow-hidden ${className}`}>
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-apex-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-apex-cyan">
          <Car className="w-4 h-4" />
          <span>Active Telemetry Chassis</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-700 hover:border-apex-cyan text-xs font-mono text-slate-300 transition-colors"
          >
            <span>Switch Car</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-dark-900/95 backdrop-blur-md border border-dark-700 shadow-2xl py-2 z-30 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500 font-bold">
                Available Garage Vehicles
              </div>
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelect(v)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-dark-800 transition-colors ${
                    active.id === v.id ? 'bg-dark-800/80 text-apex-cyan' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold font-sans">
                      {v.make} {v.model}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{v.specs}</div>
                  </div>
                  {active.id === v.id && <Check className="w-4 h-4 text-apex-cyan" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Vehicle Info */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-display font-black text-white tracking-tight">
            {active.make} {active.model}
          </h3>
          <span className="text-xs font-mono text-slate-400">({active.year})</span>
        </div>
        <p className="text-xs font-mono text-apex-cyan mt-1 flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>{active.specs}</span>
        </p>
      </div>

      {/* Chassis Telemetry Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Engine Oil Temp */}
        <div className="p-3 rounded-2xl bg-dark-900/60 border border-dark-700/60">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-apex-emerald" />
            <span>Oil Temp</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {active.oilTempC}°C
          </div>
          <span className="text-[10px] font-mono text-apex-emerald font-semibold">
            Optimal Range
          </span>
        </div>

        {/* Brake Pad Wear */}
        <div className="p-3 rounded-2xl bg-dark-900/60 border border-dark-700/60">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-1">
            <Wrench className="w-3.5 h-3.5 text-apex-gold" />
            <span>Brake Life</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {active.brakeWearPct}%
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Front / Rear
          </span>
        </div>

        {/* Fuel / Battery */}
        <div className="p-3 rounded-2xl bg-dark-900/60 border border-dark-700/60">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-apex-cyan" />
            <span>Hybrid / Fuel</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {active.fuelBatteryPct}%
          </div>
          <span className="text-[10px] font-mono text-apex-cyan">
            Est: 240 km
          </span>
        </div>
      </div>
    </div>
  );
};
