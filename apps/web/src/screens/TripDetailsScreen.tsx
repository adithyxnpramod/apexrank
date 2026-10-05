import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Visibility } from '@apextrack/shared';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Flame,
  Globe,
  Lock,
  Navigation,
  Share2,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import { RouteMap } from '../components/RouteMap';
import { TelemetryStatCard } from '../components/TelemetryStatCard';

export const TripDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [unit, setUnit] = useState<'km/h' | 'mph'>('km/h');

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? api.getTrip(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const visibilityMutation = useMutation({
    mutationFn: (newVis: Visibility) =>
      id ? api.updateTripVisibility(id, newVis) : Promise.reject(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['trip', id], updated);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => (id ? api.deleteTrip(id) : Promise.reject()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate('/history');
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
        Loading trip telemetry...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-apex-coral mx-auto" />
        <h2 className="text-xl font-bold text-white">Trip Not Found</h2>
        <p className="text-slate-400 text-sm font-mono">
          The requested drive recording could not be loaded.
        </p>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 rounded-xl bg-dark-800 text-slate-200 border border-dark-600 hover:bg-dark-700 text-xs font-mono"
        >
          Return to History
        </button>
      </div>
    );
  }

  // Format metric values
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

  const formatDuration = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const idleTimeS = Math.max(0, (trip.durationS ?? 0) - (trip.movingTimeS ?? 0));

  const shareUrl = `${window.location.origin}/t/${trip.shareCode || trip.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header / Back Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Drives</span>
        </button>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Unit Toggle */}
          <button
            onClick={() => setUnit((prev) => (prev === 'km/h' ? 'mph' : 'km/h'))}
            className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-mono font-bold text-apex-cyan uppercase"
          >
            {unit} ⇄
          </button>

          {/* Visibility Toggle */}
          <button
            onClick={() =>
              visibilityMutation.mutate(
                trip.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
              )
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              trip.visibility === 'PUBLIC'
                ? 'bg-apex-cyan/10 border-apex-cyan/30 text-apex-cyan'
                : 'bg-dark-800 border-dark-600 text-slate-400'
            }`}
          >
            {trip.visibility === 'PUBLIC' ? (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>PUBLIC</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>PRIVATE</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={copyShareLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-mono font-bold text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-apex-emerald" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Share'}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (window.confirm('Delete this drive recording?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-1.5 rounded-xl bg-dark-800 hover:bg-apex-coral/20 border border-dark-600 text-slate-400 hover:text-apex-coral transition-colors"
            title="Delete trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trip Title & Status Bar */}
      <div className="glass-panel rounded-3xl p-6 border border-dark-700/80 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border ${
                trip.status === 'COMPLETED'
                  ? 'bg-apex-emerald/10 text-apex-emerald border-apex-emerald/30'
                  : trip.status === 'INVALID'
                  ? 'bg-apex-coral/10 text-apex-coral border-apex-coral/30'
                  : 'bg-apex-cyan/10 text-apex-cyan border-apex-cyan/30'
              }`}
            >
              {trip.status}
            </span>

            {trip.source === 'simulated' && (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-apex-violet/10 text-apex-violet border border-apex-violet/30">
                <Sparkles className="w-3 h-3" />
                <span>Simulated Route</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(trip.startedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {trip.status === 'INVALID' && (
          <div className="p-4 rounded-xl bg-apex-coral/10 border border-apex-coral/30 text-apex-coral text-xs font-mono space-y-1">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Telemetry Anomaly Flagged: {trip.invalidReason || 'ANOMALY_DETECTED'}</span>
            </div>
            <p className="text-slate-300 text-[11px] pl-6">
              {trip.invalidReason === 'TOO_FEW_VALID_POINTS'
                ? 'The recording was stopped before receiving at least 2 valid GPS points. Take a longer drive or wait for initial satellite lock.'
                : trip.invalidReason === 'NO_POINTS_PROVIDED'
                ? 'No GPS coordinates were received before ending the recording.'
                : trip.invalidReason === 'EXCESSIVE_ANOMALIES'
                ? 'Abnormal speed spikes or clock shifts were detected. Excluded from official leaderboard rankings.'
                : 'Drive telemetry did not meet physical verification bounds. Excluded from leaderboard rankings.'}
            </p>
          </div>
        )}
      </div>

      {/* Interactive MapLibre Route Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span className="uppercase tracking-wider">GPS Polyline Map</span>
          <span>{trip.routeGeoJson?.coordinates?.length ?? 0} points rendered</span>
        </div>
        <RouteMap routeGeoJson={trip.routeGeoJson} className="h-96 w-full" />
      </div>

      {/* Telemetry Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TelemetryStatCard
          label="Total Distance"
          value={displayDist}
          subValue={`${trip.distanceM ?? 0} meters`}
          icon={Navigation}
          variant="cyan"
        />

        <TelemetryStatCard
          label="Total Duration"
          value={formatDuration(trip.durationS)}
          subValue="Elapsed wall time"
          icon={Clock}
          variant="violet"
        />

        <TelemetryStatCard
          label="Moving Time"
          value={formatDuration(trip.movingTimeS)}
          subValue={`Stopped idle: ${formatDuration(idleTimeS)}`}
          icon={Zap}
          variant="emerald"
        />

        <TelemetryStatCard
          label="Top Speed"
          value={topSpeed}
          subValue={`Avg: ${avgSpeed}`}
          icon={Flame}
          variant="coral"
        />
      </div>

      {/* Share Box */}
      {trip.visibility === 'PUBLIC' && (
        <div className="glass-panel rounded-2xl p-5 border border-dark-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-white">Public Telemetry Share Link</h4>
            <p className="text-xs text-slate-400 font-mono">
              Share code: <span className="text-apex-cyan font-bold">{trip.shareCode}</span> • Anyone with this link can view this route without logging in.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-dark-900 border border-dark-700 text-xs font-mono text-slate-300 rounded-xl px-3 py-2 w-full sm:w-72 select-all focus:outline-none focus:border-apex-cyan"
            />
            <button
              onClick={copyShareLink}
              className="px-3.5 py-2 rounded-xl bg-apex-cyan text-dark-950 font-bold text-xs font-mono flex items-center space-x-1.5 hover:brightness-110 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
