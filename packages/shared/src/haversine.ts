import { EARTH_RADIUS_M } from './types';

export interface LatLon {
  lat: number;
  lon: number;
}

/**
 * Converts degrees to radians.
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Computes the great-circle spherical distance between two points on Earth
 * using the Haversine formula.
 *
 * @param a Starting point with lat and lon in decimal degrees
 * @param b Ending point with lat and lon in decimal degrees
 * @returns Distance in meters (SI)
 */
export function haversineM(a: LatLon, b: LatLon): number {
  // If coordinates are identical, short-circuit to exact 0
  if (a.lat === b.lat && a.lon === b.lon) {
    return 0;
  }

  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon;

  // Protect against floating-point inaccuracies that could slightly exceed 1.0
  const clampedH = Math.min(1, Math.max(0, h));

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(clampedH));
}

/**
 * Computes the initial bearing (compass heading in degrees, 0..360)
 * from point a to point b along a great circle.
 */
export function initialBearingDeg(a: LatLon, b: LatLon): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(b.lon - a.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const radians = Math.atan2(y, x);
  const degrees = toDegrees(radians);

  // Normalize to 0..360
  return (degrees + 360) % 360;
}

/**
 * Calculates a new coordinate given a starting coordinate, a travel distance in meters,
 * and a travel bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West).
 *
 * Essential for accurate simulated calibration drives.
 */
export function destinationPoint(
  start: LatLon,
  distanceM: number,
  bearingDeg: number
): LatLon {
  const delta = distanceM / EARTH_RADIUS_M;
  const theta = toRadians(bearingDeg);

  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);

  const lat2 = Math.asin(
    sinLat1 * cosDelta + cosLat1 * sinDelta * Math.cos(theta)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(theta) * sinDelta * cosLat1,
      cosDelta - sinLat1 * Math.sin(lat2)
    );

  return {
    lat: toDegrees(lat2),
    lon: ((toDegrees(lon2) + 540) % 360) - 180, // Normalize to -180..+180
  };
}

/**
 * Presentation helper: Convert m/s to km/h.
 */
export function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

/**
 * Presentation helper: Convert m/s to mph.
 */
export function mpsToMph(mps: number): number {
  return mps * 2.236936;
}

/**
 * Presentation helper: Convert meters to kilometers.
 */
export function metersToKm(meters: number): number {
  return meters / 1000;
}

/**
 * Presentation helper: Convert meters to miles.
 */
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}
