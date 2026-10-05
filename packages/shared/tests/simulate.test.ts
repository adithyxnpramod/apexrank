import { describe, expect, it } from 'vitest';
import { simplifyRoute, toGeoJsonLineString } from '../src/simplify';
import {
  generateAnomalyDrive,
  generateCalibrationDrive,
  generateCityDrive,
} from '../src/simulate';
import { validatePoints } from '../src/validate';

describe('Drive Simulators and Route Simplification', () => {
  it('generates a valid calibration drive with 51 points for 1000m at 20 m/s', () => {
    const points = generateCalibrationDrive({
      distanceM: 1000,
      speedMps: 20,
      sampleRateHz: 1,
    });

    expect(points.length).toBe(51); // 0s through 50s
    expect(points[0].speedMps).toBe(20);
    expect(points[0].mocked).toBe(true);

    const validation = validatePoints(points);
    expect(validation.isTripValid).toBe(true);
    expect(validation.validPointsCount).toBe(51);
  });

  it('generates a city drive that passes all validation checks', () => {
    const points = generateCityDrive();
    const validation = validatePoints(points);

    expect(validation.isTripValid).toBe(true);
    expect(validation.suspiciousJumpsCount).toBe(0);
    expect(points.length).toBeGreaterThan(60);
  });

  it('generates an anomaly drive and detects all injected anomalies', () => {
    const anomalyPoints = generateAnomalyDrive();
    const validation = validatePoints(anomalyPoints);

    // Should detect inaccurate GPS, speed teleport, and backwards timestamp
    expect(validation.suspiciousJumpsCount).toBeGreaterThanOrEqual(2);
    const inaccuratePoint = validation.points.find(
      (p) => p.anomalyReason === 'INSUFFICIENT_ACCURACY'
    );
    const teleportPoint = validation.points.find(
      (p) => p.anomalyReason === 'SPEED_TELEPORT'
    );
    const backwardsPoint = validation.points.find(
      (p) => p.anomalyReason === 'BACKWARDS_TIMESTAMP'
    );

    expect(inaccuratePoint).toBeDefined();
    expect(teleportPoint).toBeDefined();
    expect(backwardsPoint).toBeDefined();
  });

  it('simplifies a straight line route down to 2 endpoints with Douglas-Peucker', () => {
    // 51 points along a straight line
    const straightLine = generateCalibrationDrive({
      distanceM: 1000,
      speedMps: 20,
    });

    // Tolerance of 1 meter on a straight line should eliminate all intermediate points
    const simplified = simplifyRoute(straightLine, 1.0);
    expect(simplified.length).toBe(2);
    expect(simplified[0].lat).toBe(straightLine[0].lat);
    expect(simplified[1].lat).toBe(straightLine[straightLine.length - 1].lat);

    const geoJson = toGeoJsonLineString(straightLine, 1.0);
    expect(geoJson.type).toBe('LineString');
    expect(geoJson.coordinates.length).toBe(2);
  });
});
