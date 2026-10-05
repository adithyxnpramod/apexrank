import { describe, expect, it } from 'vitest';
import {
  generateCalibrationDrive,
  generateCityDrive,
  generateStationaryDrive,
} from '../src/simulate';
import { computeStats } from '../src/stats';

describe('Trip Statistics Engine', () => {
  it('correctly calculates 1,000 meter calibration drive at 20 m/s', () => {
    // 1000m at 20 m/s = 50 seconds duration
    const drive = generateCalibrationDrive({
      distanceM: 1000,
      speedMps: 20,
      sampleRateHz: 1,
    });

    const stats = computeStats(drive);

    expect(stats.status).toBe('COMPLETED');
    expect(stats.distanceM).toBeCloseTo(1000, 1);
    expect(stats.durationS).toBe(50);
    expect(stats.movingTimeS).toBe(50);
    expect(stats.idleTimeS).toBe(0);
    expect(stats.avgSpeedMps).toBeCloseTo(20, 1);
    expect(stats.topSpeedMps).toBeCloseTo(20, 1);
  });

  it('handles stationary trip with near-zero distance and zero moving time', () => {
    const stationary = generateStationaryDrive(60); // 60 seconds parked
    const stats = computeStats(stationary);

    expect(stats.status).toBe('COMPLETED');
    expect(stats.distanceM).toBe(0);
    expect(stats.durationS).toBe(60);
    expect(stats.movingTimeS).toBe(0);
    expect(stats.idleTimeS).toBe(60);
    expect(stats.avgSpeedMps).toBe(0);
    expect(stats.topSpeedMps).toBe(0);
  });

  it('accurately separates moving time from red light idle time during city drive', () => {
    const cityTrip = generateCityDrive();
    const stats = computeStats(cityTrip);

    expect(stats.status).toBe('COMPLETED');
    expect(stats.distanceM).toBeGreaterThan(500); // Traveled distance
    expect(stats.durationS).toBeGreaterThan(60); // Total elapsed wall time
    expect(stats.idleTimeS).toBeGreaterThanOrEqual(20); // Stopped at red light (~25s)
    expect(stats.movingTimeS).toBeGreaterThan(40);
    expect(stats.durationS).toBe(stats.movingTimeS + stats.idleTimeS);
    expect(stats.topSpeedMps).toBeGreaterThan(16); // Peak cruising speed
    expect(stats.avgSpeedMps).toBeGreaterThan(10);
  });

  it('marks trip INVALID and returns zero stats when fewer than 2 valid points', () => {
    const shortTrip = [
      { lat: 37.7749, lon: -122.4194, timestamp: 1000 },
    ];

    const stats = computeStats(shortTrip);

    expect(stats.status).toBe('INVALID');
    expect(stats.invalidReason).toBe('TOO_FEW_VALID_POINTS');
    expect(stats.distanceM).toBe(0);
    expect(stats.movingTimeS).toBe(0);
  });
});
