import { haversineM } from './haversine';
import {
  DEFAULT_VALIDATION_CONFIG,
  GpsPoint,
  RawGpsInput,
  TripStats,
  ValidatedPoint,
  ValidationConfig,
} from './types';
import { validatePoints } from './validate';

/**
 * Computes verified physical driving metrics from a series of GPS points.
 *
 * @param input Array of raw, normalized, or already validated GPS points
 * @param customConfig Optional threshold overrides
 */
export function computeStats(
  input: (RawGpsInput | GpsPoint | ValidatedPoint)[],
  customConfig?: Partial<ValidationConfig>
): TripStats {
  const config: ValidationConfig = {
    ...DEFAULT_VALIDATION_CONFIG,
    ...customConfig,
  };

  // Run validation
  const validation = validatePoints(input as GpsPoint[], config);
  const validPoints = validation.points.filter((p) => p.isValid);

  if (validPoints.length < config.minPointsRequired) {
    return {
      distanceM: 0,
      durationS: 0,
      movingTimeS: 0,
      idleTimeS: 0,
      avgSpeedMps: 0,
      topSpeedMps: 0,
      totalPoints: input.length,
      validPoints: validPoints.length,
      suspiciousJumps: validation.suspiciousJumpsCount,
      status: 'INVALID',
      invalidReason: validation.invalidReason ?? 'TOO_FEW_VALID_POINTS',
    };
  }

  let totalDistanceM = 0;
  let totalMovingTimeS = 0;
  let topSpeedMps = 0;

  for (let i = 1; i < validPoints.length; i++) {
    const prev = validPoints[i - 1];
    const curr = validPoints[i];

    // Compute segment metrics
    const segmentDistanceM =
      curr.distanceFromPrevM ?? haversineM(prev, curr);
    const segmentDurationS =
      curr.timeDeltaS ?? (curr.timestamp - prev.timestamp) / 1000;

    if (segmentDurationS <= 0) continue;

    const segmentSpeedMps = segmentDistanceM / segmentDurationS;

    // Filter impossible speeds just in case
    if (segmentSpeedMps <= config.maxSpeedMps) {
      totalDistanceM += segmentDistanceM;

      // Check if vehicle was actively moving or idling at a stop
      if (segmentSpeedMps >= config.movingSpeedThresholdMps) {
        totalMovingTimeS += segmentDurationS;
      }

      if (segmentSpeedMps > topSpeedMps) {
        topSpeedMps = segmentSpeedMps;
      }
    }

    // Also consider sensor-reported speed if within realistic bounds
    if (
      curr.speedMps !== undefined &&
      curr.speedMps >= 0 &&
      curr.speedMps <= config.maxSpeedMps &&
      curr.speedMps > topSpeedMps
    ) {
      topSpeedMps = curr.speedMps;
    }
  }

  const firstPoint = validPoints[0];
  const lastPoint = validPoints[validPoints.length - 1];
  const totalDurationS = Math.max(
    0,
    Math.round((lastPoint.timestamp - firstPoint.timestamp) / 1000)
  );

  const roundedMovingTimeS = Math.min(
    totalDurationS,
    Math.round(totalMovingTimeS)
  );
  const idleTimeS = Math.max(0, totalDurationS - roundedMovingTimeS);

  // Average moving speed (ignores stopped/red-light time)
  const avgSpeedMps =
    roundedMovingTimeS > 0
      ? Number((totalDistanceM / roundedMovingTimeS).toFixed(2))
      : 0;

  return {
    distanceM: Number(totalDistanceM.toFixed(2)),
    durationS: totalDurationS,
    movingTimeS: roundedMovingTimeS,
    idleTimeS,
    avgSpeedMps,
    topSpeedMps: Number(topSpeedMps.toFixed(2)),
    totalPoints: input.length,
    validPoints: validPoints.length,
    suspiciousJumps: validation.suspiciousJumpsCount,
    status: validation.isTripValid ? 'COMPLETED' : 'INVALID',
    invalidReason: validation.invalidReason,
  };
}
