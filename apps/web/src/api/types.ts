import { GpsPoint, TripStatus, Visibility } from '@apextrack/shared';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  totalDistanceM: number;
  totalDurationS: number;
  totalTrips: number;
  topSpeedMps: number;
  rankTitle: string;
  createdAt: string;
}

export interface TripRecord {
  id: string;
  clientTripId: string;
  userId: string;
  user?: {
    username: string;
    avatarUrl?: string;
  };
  status: TripStatus;
  visibility: Visibility;
  shareCode?: string;
  source: 'device' | 'simulated';
  startedAt: string;
  endedAt?: string;
  distanceM?: number;
  durationS?: number;
  movingTimeS?: number;
  avgSpeedMps?: number;
  topSpeedMps?: number;
  routeGeoJson?: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat]
  };
  points?: GpsPoint[];
  invalidReason?: string;
  createdAt: string;
}

export interface CreateTripDto {
  clientTripId: string;
  startedAt: string;
  source?: 'device' | 'simulated';
  visibility?: Visibility;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  value: number; // topSpeedMps, totalDistanceM, or totalTrips depending on metric
  secondaryValue?: string; // Human readable formatted value
  tripCount?: number;
  achievedAt?: string;
}

export type LeaderboardMetric = 'speed' | 'distance' | 'trips';

export interface WeeklyActivityDay {
  day: string; // 'Mon', 'Tue', etc.
  date: string;
  distanceKm: number;
  trips: number;
  avgSpeedKmh: number;
  peakSpeedKmh: number;
}

export interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  year: number;
  specs: string; // e.g. "518 HP • 4.0L Boxer-6"
  oilTempC: number;
  brakeWearPct: number;
  fuelBatteryPct: number;
  isDefault: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  glowColor: 'cyan' | 'violet' | 'emerald' | 'gold';
  unlockedAt?: string;
  progressPct?: number;
}

export interface DashboardData {
  user: UserProfile;
  driverLevel: number;
  rankBadge: string;
  safetyScore: number; // 0 - 100 rating
  totalHotLaps: number;
  maxLateralG: number;
  weeklyActivity: WeeklyActivityDay[];
  weeklyTotalDistanceKm: number;
  weeklyDistanceDeltaPct: number;
  activeVehicle: VehicleRecord;
  garage: VehicleRecord[];
  achievements: AchievementBadge[];
  recentTrips: TripRecord[];
}

export interface DriverComparisonData {
  driverA: {
    id: string;
    username: string;
    rankBadge: string;
    driverLevel: number;
    avatarUrl?: string;
    vehicle: string;
    topSpeedKmh: number;
    avgSpeedKmh: number;
    totalDistanceKm: number;
    safetyRating: number;
    consistencyPct: number;
    maxCorneringG: number;
    throttleSmoothnessPct: number;
  };
  driverB: {
    id: string;
    username: string;
    rankBadge: string;
    driverLevel: number;
    avatarUrl?: string;
    vehicle: string;
    topSpeedKmh: number;
    avgSpeedKmh: number;
    totalDistanceKm: number;
    safetyRating: number;
    consistencyPct: number;
    maxCorneringG: number;
    throttleSmoothnessPct: number;
  };
  scoreA: number;
  scoreB: number;
  gapText: string;
  radarAxes: {
    label: string;
    valueA: number; // 0 - 100 normalized
    valueB: number; // 0 - 100 normalized
    rawValueA: string;
    rawValueB: string;
    winner: 'A' | 'B' | 'TIE';
  }[];
  deltas: {
    parameter: string;
    sector: string;
    valueA: string;
    valueB: string;
    delta: string;
    winner: 'A' | 'B' | 'TIE';
  }[];
  sharedCircuitBattles: {
    circuit: string;
    conditions: string;
    lapTimeA: string;
    lapTimeB: string;
    gap: string;
    winner: 'A' | 'B';
  }[];
}

