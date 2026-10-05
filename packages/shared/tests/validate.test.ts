import { describe, expect, it } from 'vitest';
import { GpsPoint } from '../src/types';
import { validatePoints } from '../src/validate';

describe('GPS Stream Validation & Anomaly Detection', () => {
  it('flags coordinates that exceed physical Earth bounds', () => {
    const points: GpsPoint[] = [
      { lat: 95.0, lon: 10.0, timestamp: 1000 }, // Invalid latitude (> 90)
      { lat: 10.0, lon: 190.0, timestamp: 2000 }, // Invalid longitude (> 180)
      { lat: NaN, lon: 10.0, timestamp: 3000 }, // NaN
    ];

    const result = validatePoints(points);

    expect(result.validPointsCount).toBe(0);
    expect(result.points[0].anomalyReason).toBe('COORDINATES_OUT_OF_BOUNDS');
    expect(result.points[1].anomalyReason).toBe('COORDINATES_OUT_OF_BOUNDS');
    expect(result.points[2].anomalyReason).toBe('COORDINATES_OUT_OF_BOUNDS');
  });

  it('rejects points with poor GPS accuracy (> 65m)', () => {
    const points: GpsPoint[] = [
      { lat: 37.7749, lon: -122.4194, timestamp: 1000, accuracyM: 5.0 },
      { lat: 37.775, lon: -122.4193, timestamp: 2000, accuracyM: 85.0 }, // Poor accuracy
      { lat: 37.7751, lon: -122.4192, timestamp: 3000, accuracyM: 10.0 },
    ];

    const result = validatePoints(points);

    expect(result.points[0].isValid).toBe(true);
    expect(result.points[1].isValid).toBe(false);
    expect(result.points[1].anomalyReason).toBe('INSUFFICIENT_ACCURACY');
    expect(result.points[2].isValid).toBe(true);
    expect(result.validPointsCount).toBe(2);
  });

  it('detects backwards or duplicate timestamps', () => {
    const points: GpsPoint[] = [
      { lat: 37.7749, lon: -122.4194, timestamp: 5000 },
      { lat: 37.775, lon: -122.4193, timestamp: 5000 }, // Duplicate timestamp (delta = 0)
      { lat: 37.7751, lon: -122.4192, timestamp: 4000 }, // Backwards timestamp (in past)
    ];

    const result = validatePoints(points);

    expect(result.points[0].isValid).toBe(true);
    expect(result.points[1].isValid).toBe(false);
    expect(result.points[1].anomalyReason).toBe('BACKWARDS_TIMESTAMP');
    expect(result.points[2].isValid).toBe(false);
    expect(result.points[2].anomalyReason).toBe('BACKWARDS_TIMESTAMP');
  });

  it('flags impossible speed teleports (> 100 m/s = 360 km/h)', () => {
    // 11.25, 75.78 to 11.30, 76.10 in 2 seconds is ~35 km in 2s (17,500 m/s)
    const points: GpsPoint[] = [
      { lat: 11.25, lon: 75.78, timestamp: 1000 },
      { lat: 11.3, lon: 76.1, timestamp: 3000 }, // 35 km away in 2 seconds!
    ];

    const result = validatePoints(points);

    expect(result.points[0].isValid).toBe(true);
    expect(result.points[1].isValid).toBe(false);
    expect(result.points[1].anomalyReason).toBe('SPEED_TELEPORT');
    expect(result.points[1].impliedSpeedMps).toBeGreaterThan(1000);
  });

  it('flags impossible vehicle acceleration (> 15 m/s²)', () => {
    // Point 1: At 0 m/s
    // Point 2: 1 sec later, moves 5m -> speed = 5 m/s
    // Point 3: 1 sec later, moves 40m -> speed = 40 m/s -> acceleration = (40 - 5) / 1 = 35 m/s² (> 15)
    const p1: GpsPoint = { lat: 37.7749, lon: -122.4194, timestamp: 1000 };
    // Move ~5m East
    const p2: GpsPoint = { lat: 37.7749, lon: -122.419343, timestamp: 2000 };
    // Move ~40m East
    const p3: GpsPoint = { lat: 37.7749, lon: -122.41888, timestamp: 3000 };

    const result = validatePoints([p1, p2, p3]);

    expect(result.points[0].isValid).toBe(true);
    expect(result.points[1].isValid).toBe(true);
    expect(result.points[2].isValid).toBe(false);
    expect(result.points[2].anomalyReason).toBe('EXCESSIVE_ACCELERATION');
  });

  it('marks trip INVALID when valid points are below minimum (< 2 points)', () => {
    const points: GpsPoint[] = [
      { lat: 37.7749, lon: -122.4194, timestamp: 1000 },
    ];

    const result = validatePoints(points);

    expect(result.validPointsCount).toBe(1);
    expect(result.isTripValid).toBe(false);
    expect(result.invalidReason).toBe('TOO_FEW_VALID_POINTS');
  });

  it('marks trip INVALID when anomaly ratio exceeds 20%', () => {
    const points: GpsPoint[] = [
      { lat: 37.7749, lon: -122.4194, timestamp: 1000 },
      { lat: 37.775, lon: -122.4193, timestamp: 2000 },
      { lat: 37.7751, lon: -122.4192, timestamp: 3000 },
      { lat: 50.0, lon: 50.0, timestamp: 4000 }, // Teleport 1
      { lat: 60.0, lon: 60.0, timestamp: 5000 }, // Teleport 2
    ];

    const result = validatePoints(points);

    expect(result.suspiciousJumpsCount).toBe(2);
    expect(result.isTripValid).toBe(false);
    expect(result.invalidReason).toBe('EXCESSIVE_ANOMALIES');
  });
});
