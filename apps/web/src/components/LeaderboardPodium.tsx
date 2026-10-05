import React from 'react';
import { Crown } from 'lucide-react';
import { LeaderboardEntry } from '../api/types';

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
  currentUserId?: string;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  topThree,
  currentUserId,
}) => {
  if (topThree.length < 3) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const renderCard = (
    entry: LeaderboardEntry,
    rank: 1 | 2 | 3,
    colorClass: string,
    borderClass: string,
    badgeBg: string,
    heightClass: string
  ) => {
    const isMe = entry.userId === currentUserId;

    return (
      <div
        className={`flex-1 flex flex-col items-center justify-end ${heightClass} relative`}
      >
        {/* Crown for 1st place */}
        {rank === 1 && (
          <div className="absolute -top-6 text-apex-gold animate-bounce">
            <Crown className="w-8 h-8 fill-apex-gold" />
          </div>
        )}

        {/* Driver Avatar */}
        <div className="relative mb-2">
          <img
            src={
              entry.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={entry.username}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${borderClass} shadow-lg`}
          />
          <div
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full ${badgeBg} text-dark-950 font-black text-xs flex items-center justify-center border border-white font-mono`}
          >
            {rank}
          </div>
        </div>

        {/* Podium Pillar */}
        <div
          className={`w-full rounded-2xl glass-card p-3 sm:p-4 text-center border ${borderClass} flex flex-col items-center justify-center ${
            isMe ? 'ring-2 ring-apex-cyan ring-offset-2 ring-offset-dark-950' : ''
          }`}
        >
          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[120px]">
            {entry.username}
          </span>
          <span className={`font-mono font-extrabold text-sm sm:text-lg ${colorClass} mt-0.5`}>
            {entry.secondaryValue || entry.value}
          </span>
          {entry.tripCount && (
            <span className="text-[10px] font-mono text-slate-400 mt-1">
              {entry.tripCount} drives
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-xl mx-auto my-6 px-2">
      {/* 2nd Place (Silver) */}
      {renderCard(
        second,
        2,
        'text-slate-300',
        'border-slate-400/40',
        'bg-slate-300',
        'h-52'
      )}

      {/* 1st Place (Gold) */}
      {renderCard(
        first,
        1,
        'text-apex-gold text-glow-gold',
        'border-apex-gold/60 shadow-glow-gold',
        'bg-apex-gold',
        'h-60'
      )}

      {/* 3rd Place (Bronze) */}
      {renderCard(
        third,
        3,
        'text-amber-600',
        'border-amber-600/40',
        'bg-amber-600',
        'h-44'
      )}
    </div>
  );
};
