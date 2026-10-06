import { GpsPoint, Visibility } from '@apextrack/shared';
import { ApiClient } from './client';
import {
  CreateTripDto,
  DashboardData,
  DriverComparisonData,
  LeaderboardEntry,
  LeaderboardMetric,
  TripRecord,
  UserProfile,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class HttpApiClient implements ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('apextrack_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/me');
  }

  async updateProfile(bio?: string, username?: string): Promise<UserProfile> {
    return this.request<UserProfile>('/me', {
      method: 'PATCH',
      body: JSON.stringify({ bio, username }),
    });
  }

  async createTrip(dto: CreateTripDto): Promise<TripRecord> {
    return this.request<TripRecord>('/trips', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async uploadPointsBatch(
    tripId: string,
    points: GpsPoint[]
  ): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/trips/${tripId}/points`, {
      method: 'POST',
      body: JSON.stringify({ points }),
    });
  }

  async finishTrip(tripId: string): Promise<TripRecord> {
    return this.request<TripRecord>(`/trips/${tripId}/finish`, {
      method: 'POST',
    });
  }

  async getTrips(
    page: number = 1,
    limit: number = 20
  ): Promise<{ trips: TripRecord[]; total: number }> {
    return this.request<{ trips: TripRecord[]; total: number }>(
      `/trips?page=${page}&limit=${limit}`
    );
  }

  async getTrip(tripId: string): Promise<TripRecord> {
    return this.request<TripRecord>(`/trips/${tripId}`);
  }

  async updateTripVisibility(
    tripId: string,
    visibility: Visibility
  ): Promise<TripRecord> {
    return this.request<TripRecord>(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    });
  }

  async deleteTrip(tripId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  async getLeaderboard(metric: LeaderboardMetric): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`/leaderboards/${metric}`);
  }

  async getPublicTrip(shareCode: string): Promise<TripRecord> {
    return this.request<TripRecord>(`/public/trips/${shareCode}`);
  }

  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>('/me/dashboard');
  }

  async getDriversList(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/users');
  }

  async getDriverComparison(
    driverAId?: string,
    driverBId?: string
  ): Promise<DriverComparisonData> {
    const params = new URLSearchParams();
    if (driverAId) params.set('userA', driverAId);
    if (driverBId) params.set('userB', driverBId);
    return this.request<DriverComparisonData>(`/compare?${params.toString()}`);
  }
}

