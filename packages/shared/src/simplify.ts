import { haversineM, initialBearingDeg, LatLon, toRadians } from './haversine';
import { EARTH_RADIUS_M, GpsPoint } from './types';

/**
 * Computes the perpendicular cross-track distance in meters
 * from a point P to a great-circle path defined by start and end points.
 */
function crossTrackDistanceM(point: LatLon, start: LatLon, end: LatLon): number {
  const d13 = haversineM(start, point);
  if (d13 === 0) return 0;

  const theta13 = toRadians(initialBearingDeg(start, point));
  const theta12 = toRadians(initialBearingDeg(start, end));

  const distanceRatio = d13 / EARTH_RADIUS_M;
  const sinDistance = Math.sin(distanceRatio);
  const sinAngleDelta = Math.sin(theta13 - theta12);

  const crossTrackRadians = Math.asin(
    Math.min(1, Math.max(-1, sinDistance * sinAngleDelta))
  );

  return Math.abs(crossTrackRadians) * EARTH_RADIUS_M;
}

/**
 * Simplifies a polyline of GPS points using the Ramer-Douglas-Peucker algorithm.
 * Drastically reduces the number of points for map rendering while preserving
 * visual fidelity and sharp turns.
 *
 * @param points Array of GPS points
 * @param toleranceM Maximum allowed perpendicular error in meters (default: 5.0m)
 */
export function simplifyRoute<T extends LatLon>(
  points: T[],
  toleranceM: number = 5.0
): T[] {
  if (points.length <= 2) {
    return points;
  }

  const start = points[0];
  const end = points[points.length - 1];

  let maxDistance = 0;
  let indexMax = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = crossTrackDistanceM(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      indexMax = i;
    }
  }

  if (maxDistance > toleranceM) {
    const leftRecursive = simplifyRoute(
      points.slice(0, indexMax + 1),
      toleranceM
    );
    const rightRecursive = simplifyRoute(points.slice(indexMax), toleranceM);

    return [...leftRecursive.slice(0, -1), ...rightRecursive];
  }

  return [start, end];
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [longitude, latitude]
}

/**
 * Converts a sequence of GPS points into GeoJSON LineString coordinates [lon, lat],
 * optionally downsampling with Douglas-Peucker.
 */
export function toGeoJsonLineString(
  points: (GpsPoint | LatLon)[],
  toleranceM: number = 5.0
): GeoJsonLineString {
  const simplified = simplifyRoute(points, toleranceM);
  return {
    type: 'LineString',
    coordinates: simplified.map((p) => [p.lon, p.lat]),
  };
}
