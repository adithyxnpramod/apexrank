import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TelemetryStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'gold' | 'emerald' | 'coral' | 'violet';
}

const colorVariants = {
  cyan: {
    iconBg: 'bg-apex-cyan/10 border-apex-cyan/20 text-apex-cyan',
    glow: 'group-hover:border-apex-cyan/40',
  },
  gold: {
    iconBg: 'bg-apex-gold/10 border-apex-gold/20 text-apex-gold',
    glow: 'group-hover:border-apex-gold/40',
  },
  emerald: {
    iconBg: 'bg-apex-emerald/10 border-apex-emerald/20 text-apex-emerald',
    glow: 'group-hover:border-apex-emerald/40',
  },
  coral: {
    iconBg: 'bg-apex-coral/10 border-apex-coral/20 text-apex-coral',
    glow: 'group-hover:border-apex-coral/40',
  },
  violet: {
    iconBg: 'bg-apex-violet/10 border-apex-violet/20 text-apex-violet',
    glow: 'group-hover:border-apex-violet/40',
  },
};

export const TelemetryStatCard: React.FC<TelemetryStatCardProps> = ({
  label,
  value,
  unit,
  subValue,
  icon: Icon,
  variant = 'cyan',
}) => {
  const styles = colorVariants[variant];

  return (
    <div
      className={`group glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-dark-700/60 ${styles.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center border ${styles.iconBg}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="font-mono text-xs font-semibold text-slate-400 uppercase">
              {unit}
            </span>
          )}
        </div>
        {subValue && (
          <p className="mt-1 text-xs text-slate-400 font-mono tracking-tight">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};
