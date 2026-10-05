import { describe, expect, it } from 'vitest';
import {
  destinationPoint,
  haversineM,
  initialBearingDeg,
  metersToKm,
  metersToMiles,
  mpsToKmh,
  mpsToMph,
} from '../src/haversine';
import { EARTH_RADIUS_M } from '../src/types';

describe('Haversine Great-Circle Distance Formula', () => {
  it('returns 0 for identical coordinates', () => {
    const point = { lat: 37.7749, lon: -122.4194 };
    expect(haversineM(point, point)).toBe(0);
  });

  it('is symmetric: distance(A, B) === distance(B, A)', () => {
    const a = { lat: 40.7128, lon: -74.006 }; // New York
    const b = { lat: 51.5074, lon: -0.1278 }; // London

    const distAB = haversineM(a, b);
    const distBA = haversineM(b, a);

    expect(distAB).toBeGreaterThan(5_500_000); // ~5,570 km
    expect(distAB).toBeCloseTo(distBA, 5);
  });

  it('measures exactly one-quarter Earth circumference from North Pole to Equator', () => {
    const northPole = { lat: 90, lon: 0 };
    const equatorPoint = { lat: 0, lon: 0 };

    const expectedDistanceM = (Math.PI / 2) * EARTH_RADIUS_M; // ~10,007,543.4 m
    const calculatedDistanceM = haversineM(northPole, equatorPoint);

    expect(calculatedDistanceM).toBeCloseTo(expectedDistanceM, 1);
  });

  it('accurately verifies destination point navigation at 1,000 meters', () => {
    const start = { lat: 37.7749, lon: -122.4194 };
    const targetDistanceM = 1000; // 1 km
    const bearingDeg = 90; // Due East

    const destination = destinationPoint(start, targetDistanceM, bearingDeg);
    const measuredDistanceM = haversineM(start, destination);

    // Should match within millimeters
    expect(measuredDistanceM).toBeCloseTo(targetDistanceM, 2);
  });

  it('computes initial bearing accurately', () => {
    const start = { lat: 0, lon: 0 };
    const north = { lat: 10, lon: 0 };
    const east = { lat: 0, lon: 10 };

    expect(initialBearingDeg(start, north)).toBeCloseTo(0, 2);
    expect(initialBearingDeg(start, east)).toBeCloseTo(90, 2);
  });

  it('converts units correctly', () => {
    expect(mpsToKmh(10)).toBeCloseTo(36.0, 2);
    expect(mpsToMph(10)).toBeCloseTo(22.37, 2);
    expect(metersToKm(2500)).toBe(2.5);
    expect(metersToMiles(1609.344)).toBeCloseTo(1.0, 2);
  });
});
