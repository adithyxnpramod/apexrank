import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Filter, History, Play } from 'lucide-react';
import { api } from '../api';
import { TripRecord } from '../api/types';
import { TripCard } from '../components/TripCard';

export const TripHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'INVALID'>('ALL');
  const [filterSource, setFilterSource] = useState<'ALL' | 'device' | 'simulated'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'speed'>('date');

  const { data, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.getTrips(1, 100),
  });

  const trips: TripRecord[] = data?.trips || [];

  // Filter & Sort logic
  const filteredTrips = trips
    .filter((trip) => {
      if (filterStatus !== 'ALL' && trip.status !== filterStatus) return false;
      if (filterSource !== 'ALL' && trip.source !== filterSource) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return (b.distanceM ?? 0) - (a.distanceM ?? 0);
      }
      if (sortBy === 'speed') {
        return (b.topSpeedMps ?? 0) - (a.topSpeedMps ?? 0);
      }
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Drive Telemetry Logbook
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            {trips.length} drives recorded in local database
          </p>
        </div>

        <button
          onClick={() => navigate('/drive')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-apex-cyan to-apex-blue text-dark-950 font-bold text-sm shadow-glow hover:brightness-110 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-dark-950" />
          <span>New Drive</span>
        </button>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border border-dark-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-apex-cyan" />
            <span>Filter:</span>
          </span>

          {(['ALL', 'COMPLETED', 'INVALID'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                filterStatus === status
                  ? 'bg-apex-cyan text-dark-950 shadow-sm'
                  : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700'
              }`}
            >
              {status}
            </button>
          ))}

          <span className="text-slate-600">|</span>

          {(['ALL', 'device', 'simulated'] as const).map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                filterSource === src
                  ? 'bg-apex-violet text-white font-bold'
                  : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700'
              }`}
            >
              {src.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="text-xs font-mono text-slate-400 uppercase">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-dark-900 border border-dark-700 text-slate-200 text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-apex-cyan"
          >
            <option value="date">Most Recent</option>
            <option value="distance">Greatest Distance</option>
            <option value="speed">Top Speed</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="h-48 glass-panel rounded-2xl flex items-center justify-center font-mono text-slate-400 animate-pulse">
          Loading recorded telemetry sessions...
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-dark-700/60">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No matching driving sessions found</p>
          <p className="text-slate-500 text-xs font-mono mt-1">
            Try adjusting your status or source filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
};
