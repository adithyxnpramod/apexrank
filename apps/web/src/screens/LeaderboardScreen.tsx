import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, Flame, Navigation, Trophy } from 'lucide-react';
import { api } from '../api';
import { LeaderboardMetric } from '../api/types';
import { LeaderboardPodium } from '../components/LeaderboardPodium';

export const LeaderboardScreen: React.FC = () => {
  const [metric, setMetric] = useState<LeaderboardMetric>('speed');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: () => api.getLeaderboard(metric),
  });

  const entries = leaderboard || [];
  const topThree = entries.slice(0, 3);

  const metricTabs = [
    { id: 'speed', label: 'Top Speed', icon: Flame, desc: 'Peak verified velocity' },
    { id: 'distance', label: 'Total Distance', icon: Navigation, desc: 'Cumulative kilometers logged' },
    { id: 'trips', label: 'Total Drives', icon: Compass, desc: 'Most active drivers' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-apex-gold/10 border border-apex-gold/20 text-apex-gold text-xs font-mono">
          <Trophy className="w-3.5 h-3.5" />
          <span>Global Driver Championship</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
          Driver Leaderboards
        </h1>
        <p className="text-sm text-slate-400 font-mono">
          Rankings are calculated strictly from verified, non-simulated drives.
        </p>
      </div>

      {/* Category Tab Selector */}
      <div className="flex items-center justify-center gap-2 max-w-lg mx-auto p-1.5 rounded-2xl glass-panel border border-dark-700/80">
        {metricTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = metric === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id as LeaderboardMetric)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-apex-cyan to-apex-blue text-dark-950 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Display */}
      {isLoading ? (
        <div className="h-60 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
          Calculating global rankings...
        </div>
      ) : (
        <>
          <LeaderboardPodium topThree={topThree} currentUserId={user?.id} />

          {/* Full Standings List */}
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-2">
              Full Standings
            </h3>

            <div className="glass-panel rounded-2xl border border-dark-700/80 divide-y divide-dark-700/50 overflow-hidden">
              {entries.map((entry) => {
                const isMe = entry.userId === user?.id;

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
                      isMe ? 'bg-apex-cyan/5 border-l-4 border-apex-cyan' : 'hover:bg-dark-900/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Rank Number */}
                      <span className="w-7 text-center font-mono font-extrabold text-sm sm:text-base text-slate-400">
                        #{entry.rank}
                      </span>

                      {/* Driver Avatar */}
                      <img
                        src={
                          entry.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                        }
                        alt={entry.username}
                        className="w-10 h-10 rounded-full object-cover border border-dark-600"
                      />

                      {/* Driver Name */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">
                            {entry.username}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-apex-cyan/20 text-apex-cyan text-[10px] font-mono font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        {entry.tripCount && (
                          <span className="text-[11px] font-mono text-slate-400">
                            {entry.tripCount} completed trips
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metric Score */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-base sm:text-lg text-apex-cyan">
                        {entry.secondaryValue || entry.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
