import { GpsPoint, Visibility } from '@apextrack/shared';
import {
  CreateTripDto,
  DashboardData,
  DriverComparisonData,
  LeaderboardEntry,
  LeaderboardMetric,
  TripRecord,
  UserProfile,
} from './types';

export interface ApiClient {
  getMe(): Promise<UserProfile>;
  updateProfile(bio?: string, username?: string): Promise<UserProfile>;

  createTrip(dto: CreateTripDto): Promise<TripRecord>;
  uploadPointsBatch(tripId: string, points: GpsPoint[]): Promise<{ count: number }>;
  finishTrip(tripId: string): Promise<TripRecord>;

  getTrips(page?: number, limit?: number): Promise<{ trips: TripRecord[]; total: number }>;
  getTrip(tripId: string): Promise<TripRecord>;
  updateTripVisibility(tripId: string, visibility: Visibility): Promise<TripRecord>;
  deleteTrip(tripId: string): Promise<{ success: boolean }>;

  getLeaderboard(metric: LeaderboardMetric): Promise<LeaderboardEntry[]>;
  getPublicTrip(shareCode: string): Promise<TripRecord>;

  getDashboard(): Promise<DashboardData>;
  getDriverComparison(driverAId?: string, driverBId?: string): Promise<DriverComparisonData>;
  getDriversList(): Promise<UserProfile[]>;
}

