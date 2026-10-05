import { haversineM } from './haversine';
import {
  DEFAULT_VALIDATION_CONFIG,
  GpsPoint,
  RawGpsInput,
  ValidatedPoint,
  ValidationConfig,
} from './types';

/**
 * Normalizes any timestamp representation into UTC epoch milliseconds.
 */
export function normalizeTimestamp(timestamp: number | string | Date): number {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
    const num = Number(timestamp);
    if (!Number.isNaN(num)) {
      return num;
    }
    throw new Error(`Invalid date string: ${timestamp}`);
  }
  return timestamp;
}

export interface ValidationSummary {
  points: ValidatedPoint[];
  validPointsCount: number;
  suspiciousJumpsCount: number;
  isTripValid: boolean;
  invalidReason?: string;
}

/**
 * Validates a stream of GPS points against physical bounds, GPS accuracy,
 * monotonic time ordering, teleport speed jumps, and acceleration spikes.
 *
 * @param rawPoints Array of raw or normalized GPS points
 * @param customConfig Optional configuration overriding default thresholds
 */
export function validatePoints(
  rawPoints: (RawGpsInput | GpsPoint)[],
  customConfig?: Partial<ValidationConfig>
): ValidationSummary {
  const config: ValidationConfig = {
    ...DEFAULT_VALIDATION_CONFIG,
    ...customConfig,
  };

  if (!rawPoints || rawPoints.length === 0) {
    return {
      points: [],
      validPointsCount: 0,
      suspiciousJumpsCount: 0,
      isTripValid: false,
      invalidReason: 'NO_POINTS_PROVIDED',
    };
  }

  const validated: ValidatedPoint[] = [];
  let lastValidPoint: ValidatedPoint | null = null;
  let lastValidSpeedMps: number | null = null;
  let suspiciousJumpsCount = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const raw = rawPoints[i];
    const timestamp = normalizeTimestamp(raw.timestamp);

    const point: ValidatedPoint = {
      lat: raw.lat,
      lon: raw.lon,
      timestamp,
      accuracyM: raw.accuracyM != null ? raw.accuracyM : undefined,
      speedMps: raw.speedMps != null ? raw.speedMps : undefined,
      mocked: raw.mocked ?? false,
      isValid: true,
    };

    // 1. Check coordinate physical boundaries
    if (
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lon) ||
      point.lat < -90 ||
      point.lat > 90 ||
      point.lon < -180 ||
      point.lon > 180
    ) {
      point.isValid = false;
      point.anomalyReason = 'COORDINATES_OUT_OF_BOUNDS';
      suspiciousJumpsCount++;
      validated.push(point);
      continue;
    }

    // 2. Check GPS reported accuracy (if provided)
    if (point.accuracyM !== undefined && point.accuracyM > config.maxAccuracyM) {
      point.isValid = false;
      point.anomalyReason = 'INSUFFICIENT_ACCURACY';
      // Low GPS accuracy is an environmental filter, not necessarily malicious cheating,
      // but still discarded for stats calculation
      validated.push(point);
      continue;
    }

    // If this is the first point, or no prior valid point exists yet
    if (!lastValidPoint) {
      validated.push(point);
      lastValidPoint = point;
      continue;
    }

    // 3. Check timestamp sequence (must be strictly increasing)
    const timeDeltaMs = point.timestamp - lastValidPoint.timestamp;
    const timeDeltaS = timeDeltaMs / 1000;

    if (timeDeltaS <= 0) {
      point.isValid = false;
      point.anomalyReason = 'BACKWARDS_TIMESTAMP';
      point.timeDeltaS = timeDeltaS;
      suspiciousJumpsCount++;
      validated.push(point);
      continue;
    }

    point.timeDeltaS = timeDeltaS;

    // 4. Compute Haversine distance and implied velocity
    const distanceM = haversineM(lastValidPoint, point);
    point.distanceFromPrevM = distanceM;

    const impliedSpeedMps = distanceM / timeDeltaS;
    point.impliedSpeedMps = impliedSpeedMps;

    // Speed check: Is velocity impossible for a motor vehicle? (> 100 m/s = 360 km/h)
    if (impliedSpeedMps > config.maxSpeedMps) {
      point.isValid = false;
      point.anomalyReason = 'SPEED_TELEPORT';
      suspiciousJumpsCount++;
      validated.push(point);
      continue;
    }

    // 5. Acceleration check: Is rate of change in speed impossible? (> 15 m/s² ~ 1.5g)
    if (lastValidSpeedMps !== null) {
      const speedDelta = Math.abs(impliedSpeedMps - lastValidSpeedMps);
      const impliedAcceleration = speedDelta / timeDeltaS;
      point.impliedAccelerationMps2 = impliedAcceleration;

      if (impliedAcceleration > config.maxAccelerationMps2) {
        point.isValid = false;
        point.anomalyReason = 'EXCESSIVE_ACCELERATION';
        suspiciousJumpsCount++;
        validated.push(point);
        continue;
      }
    }

    // Point passed all checks!
    validated.push(point);
    lastValidPoint = point;
    lastValidSpeedMps = impliedSpeedMps;
  }

  const validPointsCount = validated.filter((p) => p.isValid).length;
  const suspiciousRatio = suspiciousJumpsCount / validated.length;

  let isTripValid = true;
  let invalidReason: string | undefined;

  if (validPointsCount < config.minPointsRequired) {
    isTripValid = false;
    invalidReason = 'TOO_FEW_VALID_POINTS';
  } else if (suspiciousRatio > config.maxSuspiciousRatio) {
    isTripValid = false;
    invalidReason = 'EXCESSIVE_ANOMALIES';
  }

  return {
    points: validated,
    validPointsCount,
    suspiciousJumpsCount,
    isTripValid,
    invalidReason,
  };
}
