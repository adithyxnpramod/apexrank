import {
  computeStats,
  GpsPoint,
  toGeoJsonLineString,
  Visibility,
} from '@apextrack/shared';
import { ApiClient } from './client';
import {
  ALL_DRIVERS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEADERBOARD,
  INITIAL_TRIPS,
  INITIAL_USER,
  INITIAL_VEHICLES,
  INITIAL_WEEKLY_ACTIVITY,
} from './mockData';
import {
  CreateTripDto,
  DashboardData,
  DriverComparisonData,
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

  async getDashboard(): Promise<DashboardData> {
    const user = getStoredUser();
    const trips = getStoredTrips().slice(0, 5);

    return {
      user,
      driverLevel: 84,
      rankBadge: 'APEX ELITE',
      safetyScore: 94.2,
      totalHotLaps: 342,
      maxLateralG: 1.82,
      weeklyActivity: INITIAL_WEEKLY_ACTIVITY,
      weeklyTotalDistanceKm: 1482.0,
      weeklyDistanceDeltaPct: 18.4,
      activeVehicle: INITIAL_VEHICLES[0],
      garage: INITIAL_VEHICLES,
      achievements: INITIAL_ACHIEVEMENTS,
      recentTrips: trips,
    };
  }

  async getDriversList(): Promise<UserProfile[]> {
    const me = getStoredUser();
    return [me, ...ALL_DRIVERS.filter((d) => d.id !== me.id)];
  }

  async getDriverComparison(
    driverAId?: string,
    driverBId?: string
  ): Promise<DriverComparisonData> {
    const me = getStoredUser();
    const drivers = await this.getDriversList();

    const dA = drivers.find((d) => d.id === driverAId) || me;
    const dB =
      drivers.find((d) => d.id === driverBId) ||
      drivers.find((d) => d.id !== dA.id) ||
      ALL_DRIVERS[1];

    const speedAKmh = Number(((dA.topSpeedMps || 59.4) * 3.6).toFixed(1));
    const speedBKmh = Number(((dB.topSpeedMps || 60.8) * 3.6).toFixed(1));

    const distAKm = Number(((dA.totalDistanceM || 1_482_000) / 1000).toFixed(1));
    const distBKm = Number(((dB.totalDistanceM || 1_240_000) / 1000).toFixed(1));

    return {
      driverA: {
        id: dA.id,
        username: dA.username,
        rankBadge: 'APEX ELITE',
        driverLevel: 84,
        avatarUrl: dA.avatarUrl,
        vehicle: 'Porsche 911 GT3 RS (992)',
        topSpeedKmh: speedAKmh,
        avgSpeedKmh: 94.2,
        totalDistanceKm: distAKm,
        safetyRating: 94.0,
        consistencyPct: 96.8,
        maxCorneringG: 1.82,
        throttleSmoothnessPct: 96.0,
      },
      driverB: {
        id: dB.id,
        username: dB.username,
        rankBadge: 'TRACK PRODIGY',
        driverLevel: 79,
        avatarUrl: dB.avatarUrl,
        vehicle: 'BMW M3 CS (G80)',
        topSpeedKmh: speedBKmh,
        avgSpeedKmh: 91.5,
        totalDistanceKm: distBKm,
        safetyRating: 91.0,
        consistencyPct: 95.2,
        maxCorneringG: 1.71,
        throttleSmoothnessPct: 98.0,
      },
      scoreA: 4,
      scoreB: 2,
      gapText: '-0.284s (Vance Leads)',
      radarAxes: [
        {
          label: 'Top Speed',
          valueA: 88,
          valueB: 94,
          rawValueA: `${speedAKmh} km/h`,
          rawValueB: `${speedBKmh} km/h`,
          winner: speedAKmh >= speedBKmh ? 'A' : 'B',
        },
        {
          label: 'Cornering G-Force',
          valueA: 95,
          valueB: 84,
          rawValueA: '1.82 G',
          rawValueB: '1.71 G',
          winner: 'A',
        },
        {
          label: 'Braking Efficiency',
          valueA: 94,
          valueB: 91,
          rawValueA: '94%',
          rawValueB: '91%',
          winner: 'A',
        },
        {
          label: 'Consistency',
          valueA: 96,
          valueB: 95,
          rawValueA: '96.8%',
          rawValueB: '95.2%',
          winner: 'A',
        },
        {
          label: 'Throttle Smoothness',
          valueA: 92,
          valueB: 98,
          rawValueA: '96.0%',
          rawValueB: '98.0%',
          winner: 'B',
        },
        {
          label: 'Total Mileage',
          valueA: 90,
          valueB: 82,
          rawValueA: `${distAKm} km`,
          rawValueB: `${distBKm} km`,
          winner: distAKm >= distBKm ? 'A' : 'B',
        },
      ],
      deltas: [
        {
          parameter: 'Turn 3 Apex Speed (Abbey)',
          sector: 'Sector 1',
          valueA: '184.2 km/h',
          valueB: '178.0 km/h',
          delta: '+6.2 km/h',
          winner: 'A',
        },
        {
          parameter: 'Turn 6 Braking Marker (Brooklands)',
          sector: 'Sector 2',
          valueA: '84 m',
          valueB: '91 m',
          delta: '-7 m later',
          winner: 'A',
        },
        {
          parameter: 'Max Lateral G (Maggotts/Becketts)',
          sector: 'Sector 2',
          valueA: '1.82 G',
          valueB: '1.71 G',
          delta: '+0.11 G',
          winner: 'A',
        },
        {
          parameter: 'Hangar Straight Peak Speed',
          sector: 'Sector 3',
          valueA: `${speedAKmh} km/h`,
          valueB: `${speedBKmh} km/h`,
          delta: `+${Math.abs(speedBKmh - speedAKmh).toFixed(1)} km/h`,
          winner: speedBKmh > speedAKmh ? 'B' : 'A',
        },
        {
          parameter: 'Throttle Exit Angle (Turn 18 Club)',
          sector: 'Sector 3',
          valueA: '94%',
          valueB: '97%',
          delta: '+3%',
          winner: 'B',
        },
        {
          parameter: 'Min Apex Speed (Village Chicane)',
          sector: 'Sector 1',
          valueA: '92.4 km/h',
          valueB: '89.1 km/h',
          delta: '+3.3 km/h',
          winner: 'A',
        },
      ],
      sharedCircuitBattles: [
        {
          circuit: 'Silverstone Grand Prix Circuit (UK)',
          conditions: 'Dry Asphalt • 29°C',
          lapTimeA: '1:58.214',
          lapTimeB: '1:58.498',
          gap: '-0.284s',
          winner: 'A',
        },
        {
          circuit: 'Circuit de Spa-Francorchamps (BEL)',
          conditions: 'Damp Kerbs • 19°C',
          lapTimeA: '2:19.450',
          lapTimeB: '2:18.910',
          gap: '+0.540s',
          winner: 'B',
        },
        {
          circuit: 'Nürburgring GP Strecke (GER)',
          conditions: 'Clear Sky • 24°C',
          lapTimeA: '1:36.120',
          lapTimeB: '1:36.640',
          gap: '-0.520s',
          winner: 'A',
        },
      ],
    };
  }
}

