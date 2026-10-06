import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronRight,
  Flame,
  Gauge,
  Navigation,
  Play,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import { api } from '../api';
import { AchievementsShelf } from '../components/AchievementsShelf';
import { TelemetryStatCard } from '../components/TelemetryStatCard';
import { TripCard } from '../components/TripCard';
import { VehicleGarageCard } from '../components/VehicleGarageCard';
import { WeeklyMileageChart } from '../components/WeeklyMileageChart';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  if (isLoading || !dashboard) {
    return (
      <div className="h-96 glass-panel rounded-3xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
        Loading Driver Intelligence Dashboard...
      </div>
    );
  }

  const {
    user,
    driverLevel,
    rankBadge,
    safetyScore,
    maxLateralG,
    weeklyActivity,
    weeklyTotalDistanceKm,
    weeklyDistanceDeltaPct,
    activeVehicle,
    garage,
    achievements,
    recentTrips,
  } = dashboard;

  const totalKm = (user.totalDistanceM / 1000).toFixed(1);
  const topSpeedKmh = (user.topSpeedMps * 3.6).toFixed(1);

  return (
    <div className="space-y-8 pb-20">
      {/* Driver Cockpit Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-dark-700/80 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-950 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Driver Profile & Rank */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-apex-cyan via-apex-blue to-apex-violet p-[2px] shadow-glow">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.username}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-dark-950 border border-apex-cyan text-[10px] font-mono font-bold text-apex-cyan">
                LVL {driverLevel}
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-apex-cyan/10 border border-apex-cyan/30 text-apex-cyan text-xs font-mono font-bold tracking-wider uppercase">
                  {rankBadge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  SYS: ONLINE // 50Hz TELEMETRY
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                {user.username}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-md line-clamp-1">
                {user.bio || 'Chasing clean apexes and zero idle time.'}
              </p>
            </div>
          </div>

          {/* Action CTAs: Start Drive & Compare */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/compare')}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-mono text-xs font-bold transition-all shadow-md hover:border-apex-violet"
            >
              <Swords className="w-4 h-4 text-apex-violet" />
              <span>Battle Compare</span>
            </button>

            <button
              onClick={() => navigate('/drive')}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-apex-cyan to-apex-blue text-dark-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-glow"
            >
              <Play className="w-4 h-4 fill-dark-950" />
              <span>Start Drive</span>
            </button>
          </div>
        </div>

        {/* Ambient atmospheric glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-apex-cyan/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Career Telemetry Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <TelemetryStatCard
          label="Career Odometer"
          value={totalKm}
          unit="km"
          subValue={`${((user.totalDistanceM) * 0.000621371).toFixed(1)} miles verified`}
          icon={Navigation}
          variant="cyan"
        />

        <TelemetryStatCard
          label="Peak Track Velocity"
          value={topSpeedKmh}
          unit="km/h"
          subValue={`${((user.topSpeedMps) * 2.23694).toFixed(1)} mph recorded`}
          icon={Flame}
          variant="coral"
        />

        <TelemetryStatCard
          label="Driving Efficiency"
          value={`${safetyScore.toFixed(1)}%`}
          unit="Score"
          subValue="Smooth throttle index"
          icon={ShieldCheck}
          variant="emerald"
        />

        <TelemetryStatCard
          label="Peak Lateral G"
          value={`${maxLateralG.toFixed(2)} G`}
          unit="G-Force"
          subValue="Cornering threshold"
          icon={Activity}
          variant="violet"
        />
      </div>

      {/* Analytics Row: Weekly Mileage Curve & Active Garage Chassis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Mileage Chart (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-dark-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-display font-bold text-white">
                  Weekly Driving Analytics
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-apex-emerald/10 border border-apex-emerald/30 text-apex-emerald text-[10px] font-mono font-bold">
                  +{weeklyDistanceDeltaPct}% vs last week
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Total 7-day distance: <span className="text-apex-cyan font-bold">{weeklyTotalDistanceKm} km</span>
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono text-slate-400 block">Peak Day Distance</span>
              <span className="text-sm font-mono font-bold text-white">385.0 km (Sat)</span>
            </div>
          </div>

          <WeeklyMileageChart days={weeklyActivity} />
        </div>

        {/* Active Garage Vehicle Card */}
        <div className="lg:col-span-1">
          <VehicleGarageCard
            vehicles={garage}
            activeVehicle={activeVehicle}
          />
        </div>
      </div>

      {/* Driver Telemetry Badges Trophy Shelf */}
      <AchievementsShelf achievements={achievements} />

      {/* Recent Drives Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Recent Telemetry Sessions
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              GPS polyline recordings with verified SI kinematics
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-1 text-xs font-mono font-bold text-apex-cyan hover:underline"
          >
            <span>View All Drives</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!recentTrips.length ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dark-700/60">
            <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No driving trips recorded yet</p>
            <p className="text-slate-500 text-xs font-mono mt-1">
              Start your first drive to log GPS telemetry and track metrics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
