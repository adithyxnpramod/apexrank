import React from 'react';
import { Award, CheckCircle, Flame, Moon, Trophy, Zap } from 'lucide-react';
import { AchievementBadge } from '../api/types';

interface AchievementsShelfProps {
  achievements: AchievementBadge[];
  className?: string;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  Flame,
  CheckCircle,
  Moon,
  Trophy,
  Award,
};

export const AchievementsShelf: React.FC<AchievementsShelfProps> = ({
  achievements,
  className = '',
}) => {
  return (
    <div className={`glass-panel rounded-3xl p-6 border border-dark-700/80 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white">
            Driver Telemetry Achievements
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Verified badges unlocked through real physical telemetry milestones
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-apex-cyan/10 border border-apex-cyan/30 text-apex-cyan text-xs font-mono font-bold">
          {achievements.filter((a) => (a.progressPct ?? 100) >= 100).length} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {achievements.map((badge) => {
          const Icon = ICON_MAP[badge.iconName] || Award;
          const isUnlocked = (badge.progressPct ?? 100) >= 100;

          const glowStyles = {
            cyan: 'border-apex-cyan/30 bg-apex-cyan/10 text-apex-cyan shadow-glow',
            violet: 'border-apex-violet/30 bg-apex-violet/10 text-apex-violet shadow-glow-violet',
            emerald: 'border-apex-emerald/30 bg-apex-emerald/10 text-apex-emerald shadow-glow-emerald',
            gold: 'border-apex-gold/30 bg-apex-gold/10 text-apex-gold',
          }[badge.glowColor];

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-dark-900/80 border-dark-700/80 hover:border-dark-600'
                  : 'bg-dark-950/60 border-dark-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${glowStyles}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isUnlocked && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-dark-800 text-apex-emerald font-bold border border-apex-emerald/20">
                      Earned
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white">{badge.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1 leading-snug">
                  {badge.description}
                </p>
              </div>

              {!isUnlocked && badge.progressPct !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{badge.progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-apex-cyan rounded-full"
                      style={{ width: `${badge.progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
