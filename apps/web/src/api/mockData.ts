import {
  generateCalibrationDrive,
  generateCityDrive,
  toGeoJsonLineString,
} from '@apextrack/shared';
import { LeaderboardEntry, TripRecord, UserProfile } from './types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-apex-01',
  username: 'ApexPilot',
  email: 'pilot@apextrack.dev',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Track day enthusiast & telemetry geek. Chasing clean apexes and zero idle time.',
  totalDistanceM: 48_650, // 48.65 km
  totalDurationS: 2_840, // ~47 mins
  totalTrips: 7,
  topSpeedMps: 34.2, // ~123 km/h
  rankTitle: 'Apex Master (Tier II)',
  createdAt: '2026-09-15T10:00:00Z',
};

// Generate realistic route points for initial trips
const cityPoints = generateCityDrive({
  start: { lat: 37.7749, lon: -122.4194 },
  startTimestamp: Date.now() - 86400000 * 2,
});

const calibrationPoints = generateCalibrationDrive({
  start: { lat: 37.7833, lon: -122.4167 },
  distanceM: 1000,
  speedMps: 20,
  startTimestamp: Date.now() - 86400000 * 5,
});

export const INITIAL_TRIPS: TripRecord[] = [
  {
    id: 'trip-001',
    clientTripId: 'client-trip-uuid-1',
    userId: 'usr-apex-01',
    user: {
      username: 'ApexPilot',
      avatarUrl: INITIAL_USER.avatarUrl,
    },
    status: 'COMPLETED',
    visibility: 'PUBLIC',
    shareCode: 'APEX-8842',
    source: 'device',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 2 + 180000).toISOString(),
    distanceM: 3_840,
    durationS: 180,
    movingTimeS: 155,
    avgSpeedMps: 24.77, // ~89.2 km/h
    topSpeedMps: 34.2, // ~123.1 km/h
    routeGeoJson: toGeoJsonLineString(cityPoints),
    points: cityPoints,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'trip-002',
    clientTripId: 'client-trip-uuid-2',
    userId: 'usr-apex-01',
    user: {
      username: 'ApexPilot',
      avatarUrl: INITIAL_USER.avatarUrl,
    },
    status: 'COMPLETED',
    visibility: 'PRIVATE',
    shareCode: 'APEX-3199',
    source: 'device',
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 5 + 50000).toISOString(),
    distanceM: 1000,
    durationS: 50,
    movingTimeS: 50,
    avgSpeedMps: 20.0, // 72.0 km/h
    topSpeedMps: 20.0,
    routeGeoJson: toGeoJsonLineString(calibrationPoints),
    points: calibrationPoints,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'trip-003',
    clientTripId: 'client-trip-uuid-3',
    userId: 'usr-apex-01',
    user: {
      username: 'ApexPilot',
      avatarUrl: INITIAL_USER.avatarUrl,
    },
    status: 'COMPLETED',
    visibility: 'PUBLIC',
    shareCode: 'APEX-9921',
    source: 'simulated',
    startedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 8 + 420000).toISOString(),
    distanceM: 8_420,
    durationS: 420,
    movingTimeS: 380,
    avgSpeedMps: 22.15,
    topSpeedMps: 31.8,
    routeGeoJson: toGeoJsonLineString(cityPoints),
    points: cityPoints,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

export const INITIAL_LEADERBOARD: Record<string, LeaderboardEntry[]> = {
  speed: [
    {
      rank: 1,
      userId: 'usr-turbo-01',
      username: 'TurboVeloce',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      value: 38.6, // m/s (~139 km/h)
      secondaryValue: '139.0 km/h (86.4 mph)',
      tripCount: 42,
      achievedAt: '2026-10-01T14:22:00Z',
    },
    {
      rank: 2,
      userId: 'usr-apex-01',
      username: 'ApexPilot (You)',
      avatarUrl: INITIAL_USER.avatarUrl,
      value: 34.2, // m/s (~123 km/h)
      secondaryValue: '123.1 km/h (76.5 mph)',
      tripCount: 7,
      achievedAt: '2026-10-04T19:12:00Z',
    },
    {
      rank: 3,
      userId: 'usr-ghost-03',
      username: 'GhostShifter',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      value: 32.8,
      secondaryValue: '118.1 km/h (73.4 mph)',
      tripCount: 19,
      achievedAt: '2026-09-28T09:44:00Z',
    },
    {
      rank: 4,
      userId: 'usr-drift-04',
      username: 'KanseiDrift',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      value: 30.5,
      secondaryValue: '109.8 km/h (68.2 mph)',
      tripCount: 31,
      achievedAt: '2026-10-03T18:05:00Z',
    },
    {
      rank: 5,
      userId: 'usr-cyber-05',
      username: 'NeonCruiser',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      value: 28.9,
      secondaryValue: '104.0 km/h (64.6 mph)',
      tripCount: 15,
      achievedAt: '2026-09-25T11:30:00Z',
    },
  ],
  distance: [
    {
      rank: 1,
      userId: 'usr-turbo-01',
      username: 'TurboVeloce',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      value: 245_800, // meters (~245.8 km)
      secondaryValue: '245.8 km (152.7 mi)',
      tripCount: 42,
    },
    {
      rank: 2,
      userId: 'usr-drift-04',
      username: 'KanseiDrift',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      value: 184_200,
      secondaryValue: '184.2 km (114.5 mi)',
      tripCount: 31,
    },
    {
      rank: 3,
      userId: 'usr-ghost-03',
      username: 'GhostShifter',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      value: 92_400,
      secondaryValue: '92.4 km (57.4 mi)',
      tripCount: 19,
    },
    {
      rank: 4,
      userId: 'usr-apex-01',
      username: 'ApexPilot (You)',
      avatarUrl: INITIAL_USER.avatarUrl,
      value: 48_650,
      secondaryValue: '48.7 km (30.2 mi)',
      tripCount: 7,
    },
    {
      rank: 5,
      userId: 'usr-cyber-05',
      username: 'NeonCruiser',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      value: 39_100,
      secondaryValue: '39.1 km (24.3 mi)',
      tripCount: 15,
    },
  ],
  trips: [
    {
      rank: 1,
      userId: 'usr-turbo-01',
      username: 'TurboVeloce',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      value: 42,
      secondaryValue: '42 recorded drives',
    },
    {
      rank: 2,
      userId: 'usr-drift-04',
      username: 'KanseiDrift',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      value: 31,
      secondaryValue: '31 recorded drives',
    },
    {
      rank: 3,
      userId: 'usr-ghost-03',
      username: 'GhostShifter',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      value: 19,
      secondaryValue: '19 recorded drives',
    },
    {
      rank: 4,
      userId: 'usr-cyber-05',
      username: 'NeonCruiser',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      value: 15,
      secondaryValue: '15 recorded drives',
    },
    {
      rank: 5,
      userId: 'usr-apex-01',
      username: 'ApexPilot (You)',
      avatarUrl: INITIAL_USER.avatarUrl,
      value: 7,
      secondaryValue: '7 recorded drives',
    },
  ],
};
