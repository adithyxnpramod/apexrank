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
