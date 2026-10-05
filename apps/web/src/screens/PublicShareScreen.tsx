import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Flame,
  Globe,
  Navigation,
} from 'lucide-react';
import { api } from '../api';
import { RouteMap } from '../components/RouteMap';
import { TelemetryStatCard } from '../components/TelemetryStatCard';

export const PublicShareScreen: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['publicTrip', shareCode],
    queryFn: () => (shareCode ? api.getPublicTrip(shareCode) : Promise.reject()),
    enabled: !!shareCode,
  });

  if (isLoading) {
    return (
      <div className="h-64 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
        Loading shared telemetry...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-apex-coral mx-auto" />
        <h2 className="text-xl font-bold text-white">Drive Not Found</h2>
        <p className="text-slate-400 text-sm font-mono">
          The shared telemetry with code {shareCode} is private or does not exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-apex-cyan text-dark-950 font-bold text-xs font-mono"
        >
          Go to ApexTrack
        </button>
      </div>
    );
  }

  const distanceKm = ((trip.distanceM ?? 0) / 1000).toFixed(2);
  const displayDist = `${distanceKm} km`;
  const topSpeed = `${((trip.topSpeedMps ?? 0) * 3.6).toFixed(1)} km/h`;
  const avgSpeed = `${((trip.avgSpeedMps ?? 0) * 3.6).toFixed(1)} km/h`;

  const formatDuration = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-dark-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-apex-cyan uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Shared Telemetry View</span>
            <span>•</span>
            <span>{shareCode}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-display font-black text-white">
            Verified Driving Route
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Recorded on{' '}
            {new Date(trip.startedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-apex-cyan to-apex-blue text-dark-950 font-bold text-xs shadow-glow hover:brightness-110 active:scale-95"
        >
          <span>Open ApexTrack App</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Map */}
      <RouteMap routeGeoJson={trip.routeGeoJson} className="h-96 w-full" />

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TelemetryStatCard
          label="Distance"
          value={displayDist}
          icon={Navigation}
          variant="cyan"
        />

        <TelemetryStatCard
          label="Duration"
          value={formatDuration(trip.durationS)}
          icon={Clock}
          variant="violet"
        />

        <TelemetryStatCard
          label="Top Speed"
          value={topSpeed}
          icon={Flame}
          variant="coral"
        />

        <TelemetryStatCard
          label="Avg Moving Speed"
          value={avgSpeed}
          icon={Navigation}
          variant="emerald"
        />
      </div>
    </div>
  );
};
