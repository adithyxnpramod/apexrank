import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Swords,
} from 'lucide-react';
import { api } from '../api';
import { RadarChart } from '../components/RadarChart';

export const DriverCompareScreen: React.FC = () => {
  const navigate = useNavigate();

  // Selected driver IDs
  const [driverAId, setDriverAId] = useState<string>('usr-apex-01');
  const [driverBId, setDriverBId] = useState<string>('usr-turbo-01');

  // Query available drivers
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers-list'],
    queryFn: () => api.getDriversList(),
  });

  // Query comparative telemetry data
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['driver-comparison', driverAId, driverBId],
    queryFn: () => api.getDriverComparison(driverAId, driverBId),
  });

  if (isLoading || !comparison) {
    return (
      <div className="h-96 glass-panel rounded-3xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
        Computing Head-to-Head Telemetry Vectors...
      </div>
    );
  }

  const { driverA, driverB, scoreA, scoreB, gapText, radarAxes, deltas, sharedCircuitBattles } =
    comparison;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-mono mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apex-cyan animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Head-to-Head Driver Battle
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Telemetry comparison matrix • 6-axis kinematics • Corner-by-corner deltas
          </p>
        </div>

        {/* Driver Selection Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Driver A Selector */}
          <div className="flex-1 sm:flex-initial">
            <label className="text-[10px] font-mono text-apex-cyan uppercase block mb-1">
              Driver A (Cyan)
            </label>
            <select
              value={driverAId}
              onChange={(e) => setDriverAId(e.target.value)}
              className="w-full bg-dark-900 border border-apex-cyan/40 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-apex-cyan"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.username}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-bold font-mono text-sm pt-4">VS</div>

          {/* Driver B Selector */}
          <div className="flex-1 sm:flex-initial">
            <label className="text-[10px] font-mono text-apex-violet uppercase block mb-1">
              Driver B (Violet)
            </label>
            <select
              value={driverBId}
              onChange={(e) => setDriverBId(e.target.value)}
              className="w-full bg-dark-900 border border-apex-violet/40 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-apex-violet"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Driver Hero Split & Center VS Emblem */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
        {/* Driver A Profile Card (Left - Cyan) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 border border-apex-cyan/30 bg-gradient-to-br from-dark-900 to-dark-950 relative overflow-hidden shadow-glow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={driverA.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={driverA.username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-apex-cyan shadow-glow"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-dark-950 border border-apex-cyan text-[9px] font-mono font-bold text-apex-cyan">
                L{driverA.driverLevel}
              </span>
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-full bg-apex-cyan/10 border border-apex-cyan/40 text-apex-cyan text-[10px] font-mono font-bold tracking-wider">
                {driverA.rankBadge}
              </span>
              <h2 className="text-xl font-display font-black text-white mt-1">
                {driverA.username}
              </h2>
              <p className="text-xs font-mono text-slate-400">{driverA.vehicle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Top Speed</span>
              <span className="font-bold text-white text-sm">{driverA.topSpeedKmh} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Max Lateral G</span>
              <span className="font-bold text-apex-cyan text-sm">{driverA.maxCorneringG} G</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Total Distance</span>
              <span className="font-bold text-white">{driverA.totalDistanceKm} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Safety Rating</span>
              <span className="font-bold text-apex-emerald">{driverA.safetyRating}%</span>
            </div>
          </div>
        </div>

        {/* Center VS Emblem & Live Score */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center text-center space-y-2 py-2">
          <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-700 flex items-center justify-center font-display font-black text-xl text-white shadow-xl relative">
            <Swords className="w-6 h-6 text-slate-400" />
          </div>

          <div className="px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs font-mono font-bold text-white">
            <span className="text-apex-cyan">{scoreA}</span>
            <span className="mx-1.5 text-slate-500">—</span>
            <span className="text-apex-violet">{scoreB}</span>
          </div>

          <span className="text-[10px] font-mono font-bold text-apex-emerald px-2 py-0.5 rounded bg-apex-emerald/10 border border-apex-emerald/20">
            {gapText}
          </span>
        </div>

        {/* Driver B Profile Card (Right - Violet) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 border border-apex-violet/30 bg-gradient-to-bl from-dark-900 to-dark-950 relative overflow-hidden shadow-glow-violet">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={driverB.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                alt={driverB.username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-apex-violet shadow-glow-violet"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-dark-950 border border-apex-violet text-[9px] font-mono font-bold text-apex-violet">
                L{driverB.driverLevel}
              </span>
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-full bg-apex-violet/10 border border-apex-violet/40 text-apex-violet text-[10px] font-mono font-bold tracking-wider">
                {driverB.rankBadge}
              </span>
              <h2 className="text-xl font-display font-black text-white mt-1">
                {driverB.username}
              </h2>
              <p className="text-xs font-mono text-slate-400">{driverB.vehicle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Top Speed</span>
              <span className="font-bold text-white text-sm">{driverB.topSpeedKmh} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Max Lateral G</span>
              <span className="font-bold text-apex-violet text-sm">{driverB.maxCorneringG} G</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Total Distance</span>
              <span className="font-bold text-white">{driverB.totalDistanceKm} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-700/60">
              <span className="text-slate-400 block text-[10px]">Safety Rating</span>
              <span className="font-bold text-apex-emerald">{driverB.safetyRating}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centerpiece: 6-Axis Telemetry Radar Comparison */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-dark-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-dark-700/60 pb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              6-Axis Telemetry Radar Analysis
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Normalized dynamic envelope comparing vehicle limits, control, and endurance
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-apex-cyan" />
              <span className="text-white font-bold">{driverA.username}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-apex-violet" />
              <span className="text-white font-bold">{driverB.username}</span>
            </div>
          </div>
        </div>

        <RadarChart
          axes={radarAxes}
          driverAName={driverA.username}
          driverBName={driverB.username}
        />
      </div>

      {/* Comparative Telemetry Delta Breakdown Table */}
      <div className="glass-panel rounded-3xl p-6 border border-dark-700/80 space-y-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white">
            Telemetry Delta Matrix
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Sector-by-sector micro delta metrics and driver advantages
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-dark-700 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Telemetry Parameter</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-apex-cyan">{driverA.username}</th>
                <th className="py-3 px-4 text-apex-violet">{driverB.username}</th>
                <th className="py-3 px-4 text-right">Advantage Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {deltas.map((row, idx) => (
                <tr key={idx} className="hover:bg-dark-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {row.parameter}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{row.sector}</td>
                  <td className="py-3 px-4 text-slate-200">{row.valueA}</td>
                  <td className="py-3 px-4 text-slate-200">{row.valueB}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.winner === 'A'
                          ? 'bg-apex-cyan/10 border border-apex-cyan/30 text-apex-cyan'
                          : row.winner === 'B'
                          ? 'bg-apex-violet/10 border border-apex-violet/30 text-apex-violet'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      {row.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Circuit Lap Battles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white">
            Shared Circuit Lap Battles
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Historical head-to-head lap time records on sanctioned race tracks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sharedCircuitBattles.map((battle, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-5 border border-dark-700/80 space-y-3"
            >
              <div>
                <h4 className="font-bold text-sm text-white">{battle.circuit}</h4>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  {battle.conditions}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-apex-cyan font-bold">{driverA.username}:</span>
                  <span className="text-white font-bold">{battle.lapTimeA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apex-violet font-bold">{driverB.username}:</span>
                  <span className="text-white font-bold">{battle.lapTimeB}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Lap Gap:
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    battle.winner === 'A'
                      ? 'bg-apex-cyan/10 text-apex-cyan border border-apex-cyan/20'
                      : 'bg-apex-violet/10 text-apex-violet border border-apex-violet/20'
                  }`}
                >
                  {battle.gap} ({battle.winner === 'A' ? driverA.username : driverB.username} Win)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
