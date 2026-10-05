import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Lock,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { TripRecord } from '../api/types';

interface TripCardProps {
  trip: TripRecord;
  unit?: 'km/h' | 'mph';
}

export const TripCard: React.FC<TripCardProps> = ({ trip, unit = 'km/h' }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(trip.startedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(trip.startedAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Convert distance and speeds
  const distanceKm = ((trip.distanceM ?? 0) / 1000).toFixed(2);
  const distanceMi = ((trip.distanceM ?? 0) * 0.000621371).toFixed(2);
  const displayDist = unit === 'km/h' ? `${distanceKm} km` : `${distanceMi} mi`;

  const topSpeed =
    unit === 'km/h'
      ? `${((trip.topSpeedMps ?? 0) * 3.6).toFixed(1)} km/h`
      : `${((trip.topSpeedMps ?? 0) * 2.23694).toFixed(1)} mph`;

  const avgSpeed =
    unit === 'km/h'
      ? `${((trip.avgSpeedMps ?? 0) * 3.6).toFixed(1)} km/h`
      : `${((trip.avgSpeedMps ?? 0) * 2.23694).toFixed(1)} mph`;

  // Duration in mm:ss or hh:mm:ss
  const formatDuration = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border border-dark-700/60 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header row: Status badges & Date */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wide border ${
                trip.status === 'COMPLETED'
                  ? 'bg-apex-emerald/10 text-apex-emerald border-apex-emerald/30'
                  : trip.status === 'INVALID'
                  ? 'bg-apex-coral/10 text-apex-coral border-apex-coral/30'
                  : 'bg-apex-cyan/10 text-apex-cyan border-apex-cyan/30 animate-pulse'
              }`}
            >
              {trip.status}
            </span>

            {trip.source === 'simulated' && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-apex-violet/10 text-apex-violet border border-apex-violet/20">
                <Sparkles className="w-3 h-3" />
                <span>SIM</span>
              </span>
            )}

            <span className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
              {trip.visibility === 'PUBLIC' ? (
                <Globe className="w-3.5 h-3.5 text-apex-cyan" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              )}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formattedDate} • {formattedTime}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-dark-700/40">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Distance
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-white">
              {displayDist}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Duration
            </span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="font-mono font-bold text-base sm:text-lg text-white">
                {formatDuration(trip.durationS)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Avg Speed
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-white">
              {avgSpeed}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Top Speed
            </span>
            <div className="flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-apex-coral" />
              <span className="font-mono font-bold text-base sm:text-lg text-white">
                {topSpeed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center space-x-1">
          <Navigation className="w-3 h-3 text-apex-cyan" />
          <span>{trip.routeGeoJson?.coordinates?.length ?? 0} route points</span>
        </span>
        <span className="flex items-center space-x-1 text-apex-cyan hover:underline">
          <span>View Telemetry</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
