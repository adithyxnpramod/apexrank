import {
  generateCalibrationDrive,
  generateCityDrive,
  toGeoJsonLineString,
} from '@apextrack/shared';
import {
  AchievementBadge,
  LeaderboardEntry,
  TripRecord,
  UserProfile,
  VehicleRecord,
  WeeklyActivityDay,
} from './types';

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

export const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: 'veh-01',
    make: 'Porsche',
    model: '911 GT3 RS (992)',
    year: 2024,
    specs: '518 HP • 4.0L Boxer-6 • 9,000 RPM',
    oilTempC: 98,
    brakeWearPct: 84,
    fuelBatteryPct: 78,
    isDefault: true,
  },
  {
    id: 'veh-02',
    make: 'BMW',
    model: 'M3 Competition (G80)',
    year: 2023,
    specs: '503 HP • 3.0L Twin-Turbo Inline-6',
    oilTempC: 92,
    brakeWearPct: 91,
    fuelBatteryPct: 62,
    isDefault: false,
  },
  {
    id: 'veh-03',
    make: 'Audi',
    model: 'RS6 Avant Dynamic',
    year: 2024,
    specs: '591 HP • 4.0L Twin-Turbo V8',
    oilTempC: 95,
    brakeWearPct: 88,
    fuelBatteryPct: 85,
    isDefault: false,
  },
];

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'ach-01',
    title: '200+ Club',
    description: 'Surpassed 200 km/h verified peak GPS velocity on track.',
    iconName: 'Zap',
    glowColor: 'cyan',
    unlockedAt: '2026-10-01T15:30:00Z',
    progressPct: 100,
  },
  {
    id: 'ach-02',
    title: 'Triple Apex Master',
    description: 'Maintained optimal corner entry across 3 consecutive turns.',
    iconName: 'Flame',
    glowColor: 'gold',
    unlockedAt: '2026-09-28T18:40:00Z',
    progressPct: 100,
  },
  {
    id: 'ach-03',
    title: 'Precision 95+',
    description: 'Maintained 94%+ safety & efficiency telemetry rating.',
    iconName: 'CheckCircle',
    glowColor: 'emerald',
    unlockedAt: '2026-09-25T11:20:00Z',
    progressPct: 100,
  },
  {
    id: 'ach-04',
    title: 'Night Racer',
    description: 'Logged 100+ km of nocturnal track telemetry.',
    iconName: 'Moon',
    glowColor: 'violet',
    unlockedAt: '2026-09-18T22:15:00Z',
    progressPct: 100,
  },
  {
    id: 'ach-05',
    title: 'Centurion Laps',
    description: 'Completed 100 verified driving trips on the platform.',
    iconName: 'Trophy',
    glowColor: 'cyan',
    progressPct: 42,
  },
];

export const INITIAL_WEEKLY_ACTIVITY: WeeklyActivityDay[] = [
  { day: 'Mon', date: 'Sep 29', distanceKm: 142.0, trips: 2, avgSpeedKmh: 68.4, peakSpeedKmh: 124.0 },
  { day: 'Tue', date: 'Sep 30', distanceKm: 88.5, trips: 1, avgSpeedKmh: 61.2, peakSpeedKmh: 112.5 },
  { day: 'Wed', date: 'Oct 01', distanceKm: 210.2, trips: 3, avgSpeedKmh: 84.1, peakSpeedKmh: 168.0 },
  { day: 'Thu', date: 'Oct 02', distanceKm: 195.0, trips: 2, avgSpeedKmh: 72.8, peakSpeedKmh: 145.2 },
  { day: 'Fri', date: 'Oct 03', distanceKm: 312.4, trips: 4, avgSpeedKmh: 94.6, peakSpeedKmh: 214.2 },
  { day: 'Sat', date: 'Oct 04', distanceKm: 385.0, trips: 5, avgSpeedKmh: 102.3, peakSpeedKmh: 208.7 },
  { day: 'Sun', date: 'Oct 05', distanceKm: 148.9, trips: 2, avgSpeedKmh: 76.5, peakSpeedKmh: 154.0 },
];

export const ALL_DRIVERS: UserProfile[] = [
  INITIAL_USER,
  {
    id: 'usr-turbo-01',
    username: 'Elena "Apex" Rostova',
    email: 'elena@apextrack.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'BMW Motorsport test driver. Pushing G-limits and late braking zones.',
    totalDistanceM: 245_800,
    totalDurationS: 8_920,
    totalTrips: 42,
    topSpeedMps: 60.8, // 219 km/h
    rankTitle: 'Track Prodigy',
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'usr-drift-04',
    username: 'Marcus "Drift" Kane',
    email: 'marcus@apextrack.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Lateral G enthusiast. Master of slip angle and throttle feathering.',
    totalDistanceM: 184_200,
    totalDurationS: 6_710,
    totalTrips: 31,
    topSpeedMps: 52.4, // ~188 km/h
    rankTitle: 'Apex Master (Tier I)',
    createdAt: '2026-08-20T14:30:00Z',
  },
  {
    id: 'usr-ghost-03',
    username: 'GhostShifter',
    email: 'ghost@apextrack.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Night run specialist on mountain switchbacks.',
    totalDistanceM: 92_400,
    totalDurationS: 3_820,
    totalTrips: 19,
    topSpeedMps: 48.6,
    rankTitle: 'Apex Competitor',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

