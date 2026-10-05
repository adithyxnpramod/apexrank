import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Flame,
  Gauge,
  Navigation,
  Play,
  Trophy,
} from 'lucide-react';
import { api } from '../api';
import { TelemetryStatCard } from '../components/TelemetryStatCard';
import { TripCard } from '../components/TripCard';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  });

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips', 1, 3],
    queryFn: () => api.getTrips(1, 3),
  });

  const { data: speedLeaderboard } = useQuery({
    queryKey: ['leaderboard', 'speed'],
    queryFn: () => api.getLeaderboard('speed'),
  });

  const myRank = speedLeaderboard?.find((e) => e.userId === user?.id)?.rank ?? 2;

  // Format stats
  const totalKm = ((user?.totalDistanceM ?? 0) / 1000).toFixed(1);
  const topSpeedKmh = ((user?.topSpeedMps ?? 0) * 3.6).toFixed(1);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Drive Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-dark-700/80 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-apex-cyan">
              <span className="w-2 h-2 rounded-full bg-apex-cyan animate-ping"></span>
              <span>Telemetry Hub</span>
              <span>•</span>
              <span>{user?.rankTitle || 'Apex Driver'}</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Ready to record your next apex?
            </h1>
            <p className="mt-1 text-slate-300 text-sm sm:text-base max-w-xl">
              Track live GPS telemetry, calculate acceleration & speed curves, filter
              teleport anomalies, and climb the global driver rankings.
            </p>
          </div>

          <button
            onClick={() => navigate('/drive')}
            className="flex items-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-apex-cyan via-apex-blue to-apex-violet text-dark-950 font-bold text-base hover:brightness-110 active:scale-95 transition-all shadow-glow group"
          >
            <div className="w-8 h-8 rounded-xl bg-dark-950/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-dark-950 text-dark-950 group-hover:scale-110 transition-transform" />
            </div>
            <span>Launch Active Drive</span>
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-apex-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Driver Telemetry Career Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <TelemetryStatCard
          label="Total Distance"
          value={totalKm}
          unit="km"
          subValue={`${((user?.totalDistanceM ?? 0) * 0.000621371).toFixed(1)} miles`}
          icon={Navigation}
          variant="cyan"
        />

        <TelemetryStatCard
          label="Top Speed"
          value={topSpeedKmh}
          unit="km/h"
          subValue={`${((user?.topSpeedMps ?? 0) * 2.23694).toFixed(1)} mph peak`}
          icon={Flame}
          variant="coral"
        />

        <TelemetryStatCard
          label="Total Drives"
          value={user?.totalTrips ?? 0}
          unit="trips"
          subValue="Verified telemetries"
          icon={Compass}
          variant="emerald"
        />

        <TelemetryStatCard
          label="Leaderboard Rank"
          value={`#${myRank}`}
          unit="Rank"
          subValue="Speed category"
          icon={Trophy}
          variant="gold"
        />
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Recent Drives
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Latest telemetry recordings & verified stats
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-mono font-bold text-apex-cyan hover:underline"
          >
            View All ({tripsData?.total ?? 0}) →
          </button>
        </div>

        {tripsLoading ? (
          <div className="h-40 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
            Loading telemetry history...
          </div>
        ) : !tripsData?.trips.length ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dark-700/60">
            <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No driving trips recorded yet</p>
            <p className="text-slate-500 text-xs font-mono mt-1">
              Start your first drive to log GPS telemetry and track metrics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tripsData.trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
