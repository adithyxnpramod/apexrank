import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Check,
  Compass,
  Edit3,
  Flame,
  Info,
  Mail,
  Navigation,
  RotateCcw,
  Shield,
  Timer,
} from 'lucide-react';
import { api } from '../api';
import { TelemetryStatCard } from '../components/TelemetryStatCard';

export const ProfileScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.updateProfile(bioInput, usernameInput),
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated);
      setIsEditing(false);
    },
  });

  const handleStartEdit = () => {
    if (user) {
      setBioInput(user.bio || '');
      setUsernameInput(user.username || '');
      setIsEditing(true);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all mock telemetry data back to defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (isLoading || !user) {
    return (
      <div className="h-64 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
        Loading driver telemetry profile...
      </div>
    );
  }

  const totalKm = ((user.totalDistanceM ?? 0) / 1000).toFixed(1);
  const totalHours = ((user.totalDurationS ?? 0) / 3600).toFixed(1);
  const topSpeedKmh = ((user.topSpeedMps ?? 0) * 3.6).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-dark-700/80 relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-apex-cyan shadow-glow"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-dark-950 border border-apex-cyan/40 text-apex-cyan">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {user.username}
                </h1>
                <span className="text-xs font-mono text-apex-cyan uppercase tracking-wider font-bold">
                  {user.rankTitle}
                </span>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-mono font-bold text-slate-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => updateMutation.mutate()}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-apex-cyan text-dark-950 font-mono font-bold text-xs shadow-glow hover:brightness-110"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {/* Email & Join Date */}
            <div className="flex items-center justify-center sm:justify-start space-x-4 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined Sept 2026</span>
              </span>
            </div>

            {/* Bio Editor */}
            {isEditing ? (
              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Driver Handle"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-apex-cyan focus:outline-none"
                />
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Driver bio..."
                  rows={2}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:border-apex-cyan focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-300 pt-1 font-sans max-w-xl">
                {user.bio || 'Track day telemetry driver.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Career Telemetry Metrics */}
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-4">
          Career Driving Telemetry
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryStatCard
            label="Total Distance"
            value={totalKm}
            unit="km"
            subValue={`${((user.totalDistanceM ?? 0) * 0.000621371).toFixed(1)} miles`}
            icon={Navigation}
            variant="cyan"
          />

          <TelemetryStatCard
            label="Total Drives"
            value={user.totalTrips}
            unit="trips"
            subValue="Completed recordings"
            icon={Compass}
            variant="emerald"
          />

          <TelemetryStatCard
            label="Peak Velocity"
            value={topSpeedKmh}
            unit="km/h"
            subValue={`${((user.topSpeedMps ?? 0) * 2.23694).toFixed(1)} mph`}
            icon={Flame}
            variant="coral"
          />

          <TelemetryStatCard
            label="Total Wheel Time"
            value={totalHours}
            unit="hours"
            subValue={`${Math.round(user.totalDurationS / 60)} minutes`}
            icon={Timer}
            variant="gold"
          />
        </div>
      </div>

      {/* Developer Environment & Reset Box */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-700/80 space-y-4">
        <div className="flex items-center space-x-2 text-sm font-mono text-slate-300 font-bold">
          <Info className="w-4 h-4 text-apex-cyan" />
          <span>ApexTrack Architecture & Storage</span>
        </div>

        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          ApexTrack operates in Phase 3 (Frontend with Mock Data API). All drives recorded
          in your browser are processed by <span className="text-apex-cyan">@apextrack/shared</span> mathematical engine and persisted in your browser's local storage.
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-dark-700/60 flex-wrap gap-4">
          <span className="text-xs font-mono text-slate-500">
            Engine Version: @apextrack/shared v0.1.0 • Dual ESM/CJS
          </span>

          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-apex-coral/20 border border-dark-600 text-xs font-mono text-slate-400 hover:text-apex-coral transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
