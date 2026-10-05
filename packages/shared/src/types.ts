/**
 * ApexTrack Core Telemetry Types
 *
 * All physical values are strictly represented in SI units:
 * - Distance: meters (m)
 * - Duration & Time: seconds (s)
 * - Speed: meters per second (m/s)
 * - Acceleration: meters per second squared (m/s²)
 * - Timestamp: UTC epoch milliseconds (ms)
 */

export type TripStatus =
  | 'CREATED'
  | 'RECORDING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'INVALID';

export type Visibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC';

export type AnomalyReason =
  | 'COORDINATES_OUT_OF_BOUNDS'
  | 'INSUFFICIENT_ACCURACY'
  | 'BACKWARDS_TIMESTAMP'
  | 'SPEED_TELEPORT'
  | 'EXCESSIVE_ACCELERATION';

/**
 * Raw GPS point submitted by a device or simulator.
 * Timestamp can be a unix epoch (ms), ISO string, or Date instance.
 */
export interface RawGpsInput {
  lat: number;
  lon: number;
  timestamp: number | string | Date;
  accuracyM?: number | null;
  speedMps?: number | null;
  mocked?: boolean;
}

/**
 * Normalized GPS point with epoch timestamp (ms).
 */
export interface GpsPoint {
  lat: number;
  lon: number;
  timestamp: number;
  accuracyM?: number;
  speedMps?: number;
  mocked?: boolean;
}

/**
 * Evaluated point after running through the telemetry validator.
 */
export interface ValidatedPoint extends GpsPoint {
  isValid: boolean;
  anomalyReason?: AnomalyReason;
  distanceFromPrevM?: number;
  timeDeltaS?: number;
  impliedSpeedMps?: number;
  impliedAccelerationMps2?: number;
}

/**
 * Final verified statistics for a completed or evaluated trip.
 */
export interface TripStats {
  distanceM: number;
  durationS: number;
  movingTimeS: number;
  idleTimeS: number;
  avgSpeedMps: number;
  topSpeedMps: number;
  totalPoints: number;
  validPoints: number;
  suspiciousJumps: number;
  status: TripStatus;
  invalidReason?: string;
}

/**
 * Validation configuration thresholds.
 */
export interface ValidationConfig {
  /** Maximum acceptable GPS accuracy in meters. Points with accuracy > maxAccuracyM are rejected. Default: 50m */
  maxAccuracyM: number;
  /** Maximum plausible vehicle speed in m/s (100 m/s = 360 km/h). Default: 100 m/s */
  maxSpeedMps: number;
  /** Maximum plausible vehicle acceleration in m/s² (~1.53g). Default: 15 m/s² */
  maxAccelerationMps2: number;
  /** Speed threshold to separate moving time from stopped/idle time (0.5 m/s = 1.8 km/h). Default: 0.5 m/s */
  movingSpeedThresholdMps: number;
  /** Minimum valid points required to consider a trip non-empty. Default: 3 */
  minPointsRequired: number;
  /** Ratio of suspicious jumps to total points beyond which a trip is marked INVALID. Default: 0.20 (20%) */
  maxSuspiciousRatio: number;
}

export const DEFAULT_VALIDATION_CONFIG: Readonly<ValidationConfig> = {
  maxAccuracyM: 80.0,
  maxSpeedMps: 100.0,
  maxAccelerationMps2: 15.0,
  movingSpeedThresholdMps: 0.5,
  minPointsRequired: 2,
  maxSuspiciousRatio: 0.25,
};

export const EARTH_RADIUS_M = 6_371_000;

