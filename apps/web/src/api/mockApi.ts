import {
  computeStats,
  GpsPoint,
  toGeoJsonLineString,
  Visibility,
} from '@apextrack/shared';
import { ApiClient } from './client';
import { INITIAL_LEADERBOARD, INITIAL_TRIPS, INITIAL_USER } from './mockData';
import {
  CreateTripDto,
  LeaderboardEntry,
  LeaderboardMetric,
  TripRecord,
  UserProfile,
} from './types';

const STORAGE_KEYS = {
  USER: 'apextrack_mock_user',
  TRIPS: 'apextrack_mock_trips',
  POINTS: 'apextrack_mock_points_map',
};

function getStoredUser(): UserProfile {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  }
  return JSON.parse(data);
}

function saveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function getStoredTrips(): TripRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(INITIAL_TRIPS));
    return INITIAL_TRIPS;
  }
  return JSON.parse(data);
}

function saveTrips(trips: TripRecord[]) {
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
}

function getPointsMap(): Record<string, GpsPoint[]> {
  const data = localStorage.getItem(STORAGE_KEYS.POINTS);
  if (!data) return {};
  return JSON.parse(data);
}

function savePointsMap(map: Record<string, GpsPoint[]>) {
  localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(map));
}

export class MockApiClient implements ApiClient {
  async getMe(): Promise<UserProfile> {
    return getStoredUser();
  }

  async updateProfile(bio?: string, username?: string): Promise<UserProfile> {
    const user = getStoredUser();
    if (bio !== undefined) user.bio = bio;
    if (username !== undefined) user.username = username;
    saveUser(user);
    return user;
  }

  async createTrip(dto: CreateTripDto): Promise<TripRecord> {
    const user = getStoredUser();
    const newTrip: TripRecord = {
      id: `trip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      clientTripId: dto.clientTripId,
      userId: user.id,
      user: {
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      status: 'RECORDING',
      visibility: dto.visibility ?? 'PRIVATE',
      source: dto.source ?? 'device',
      startedAt: dto.startedAt,
      createdAt: new Date().toISOString(),
    };

    const trips = getStoredTrips();
    trips.unshift(newTrip);
    saveTrips(trips);

    const pointsMap = getPointsMap();
    pointsMap[newTrip.id] = [];
    savePointsMap(pointsMap);

    return newTrip;
  }

  async uploadPointsBatch(
    tripId: string,
    points: GpsPoint[]
  ): Promise<{ count: number }> {
    const pointsMap = getPointsMap();
    const current = pointsMap[tripId] ?? [];
    pointsMap[tripId] = current.concat(points);
    savePointsMap(pointsMap);
    return { count: points.length };
  }

  async finishTrip(tripId: string): Promise<TripRecord> {
    const trips = getStoredTrips();
    const tripIndex = trips.findIndex((t) => t.id === tripId);
    if (tripIndex === -1) {
      throw new Error(`Trip not found: ${tripId}`);
    }

    const trip = trips[tripIndex];
    const pointsMap = getPointsMap();
    const points = pointsMap[tripId] ?? [];

    // Run the authoritative mathematical trip engine from packages/shared
    const stats = computeStats(points);
    const routeGeoJson = toGeoJsonLineString(points, 3.0);

    const shareCode = `APEX-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedTrip: TripRecord = {
      ...trip,
      status: stats.status,
      endedAt: new Date().toISOString(),
      distanceM: stats.distanceM,
      durationS: stats.durationS,
      movingTimeS: stats.movingTimeS,
      avgSpeedMps: stats.avgSpeedMps,
      topSpeedMps: stats.topSpeedMps,
      invalidReason: stats.invalidReason,
      routeGeoJson,
      points,
      shareCode,
    };

    trips[tripIndex] = updatedTrip;
    saveTrips(trips);

    // Update user profile telemetry career totals if completed
    if (stats.status === 'COMPLETED') {
      const user = getStoredUser();
      user.totalTrips += 1;
      user.totalDistanceM += stats.distanceM;
      user.totalDurationS += stats.durationS;
      if (stats.topSpeedMps > user.topSpeedMps) {
        user.topSpeedMps = stats.topSpeedMps;
      }
      saveUser(user);
    }

    return updatedTrip;
  }

  async getTrips(
    page: number = 1,
    limit: number = 20
  ): Promise<{ trips: TripRecord[]; total: number }> {
    const all = getStoredTrips();
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);
    return { trips: paginated, total: all.length };
  }

  async getTrip(tripId: string): Promise<TripRecord> {
    const trips = getStoredTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`);
    }

    // Attach points if not already present
    if (!trip.points) {
      const pointsMap = getPointsMap();
      trip.points = pointsMap[tripId] ?? [];
    }

    return trip;
  }

  async updateTripVisibility(
    tripId: string,
    visibility: Visibility
  ): Promise<TripRecord> {
    const trips = getStoredTrips();
    const tripIndex = trips.findIndex((t) => t.id === tripId);
    if (tripIndex === -1) {
      throw new Error(`Trip not found: ${tripId}`);
    }

    trips[tripIndex].visibility = visibility;
    saveTrips(trips);
    return trips[tripIndex];
  }

  async deleteTrip(tripId: string): Promise<{ success: boolean }> {
    const trips = getStoredTrips().filter((t) => t.id !== tripId);
    saveTrips(trips);

    const pointsMap = getPointsMap();
    delete pointsMap[tripId];
    savePointsMap(pointsMap);

    return { success: true };
  }

  async getLeaderboard(metric: LeaderboardMetric): Promise<LeaderboardEntry[]> {
    const user = getStoredUser();
    const list = [...(INITIAL_LEADERBOARD[metric] ?? [])];

    // Keep user's rank updated with their latest profile stats
    const userEntryIndex = list.findIndex((e) => e.userId === user.id);
    if (userEntryIndex !== -1) {
      if (metric === 'speed') {
        list[userEntryIndex].value = user.topSpeedMps;
        list[userEntryIndex].secondaryValue = `${(user.topSpeedMps * 3.6).toFixed(1)} km/h (${(user.topSpeedMps * 2.23694).toFixed(1)} mph)`;
      } else if (metric === 'distance') {
        list[userEntryIndex].value = user.totalDistanceM;
        list[userEntryIndex].secondaryValue = `${(user.totalDistanceM / 1000).toFixed(1)} km`;
      } else if (metric === 'trips') {
        list[userEntryIndex].value = user.totalTrips;
        list[userEntryIndex].secondaryValue = `${user.totalTrips} recorded drives`;
      }
    }

    // Re-sort based on metric value
    list.sort((a, b) => b.value - a.value);
    list.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return list;
  }

  async getPublicTrip(shareCode: string): Promise<TripRecord> {
    const trips = getStoredTrips();
    const trip = trips.find(
      (t) => t.shareCode?.toUpperCase() === shareCode.toUpperCase()
    );
    if (!trip) {
      throw new Error(`Trip with share code ${shareCode} not found`);
    }

    // Return sanitized public view (no private user details)
    return {
      ...trip,
      userId: 'anonymous',
    };
  }
}
