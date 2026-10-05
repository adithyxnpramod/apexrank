import { destinationPoint, LatLon } from './haversine';
import { GpsPoint } from './types';

export interface CalibrationDriveOptions {
  start?: LatLon;
  distanceM?: number; // default: 1000m
  speedMps?: number; // default: 20 m/s (72 km/h)
  sampleRateHz?: number; // default: 1 Hz
  startTimestamp?: number;
  bearingDeg?: number; // default: 90 (due East)
}

/**
 * Generates an exact straight-line calibration drive with zero GPS noise.
 * Used to verify mathematical precision against known ground truth.
 */
export function generateCalibrationDrive(
  options: CalibrationDriveOptions = {}
): GpsPoint[] {
  const start = options.start ?? { lat: 37.7749, lon: -122.4194 }; // San Francisco
  const targetDistanceM = options.distanceM ?? 1000;
  const speedMps = options.speedMps ?? 20; // 72 km/h
  const sampleRateHz = options.sampleRateHz ?? 1;
  const startTimestamp = options.startTimestamp ?? Date.now();
  const bearingDeg = options.bearingDeg ?? 90;

  const stepDurationS = 1 / sampleRateHz;
  const stepDistanceM = speedMps * stepDurationS;
  const totalSteps = Math.ceil(targetDistanceM / stepDistanceM);

  const points: GpsPoint[] = [];

  for (let i = 0; i <= totalSteps; i++) {
    const distanceTraveledM = Math.min(i * stepDistanceM, targetDistanceM);
    const coord = destinationPoint(start, distanceTraveledM, bearingDeg);

    points.push({
      lat: Number(coord.lat.toFixed(7)),
      lon: Number(coord.lon.toFixed(7)),
      timestamp: startTimestamp + i * stepDurationS * 1000,
      accuracyM: 5.0,
      speedMps: i === totalSteps && distanceTraveledM === targetDistanceM ? 0 : speedMps,
      mocked: true,
    });

    if (distanceTraveledM >= targetDistanceM) break;
  }

  return points;
}

export interface CityDriveOptions {
  start?: LatLon;
  startTimestamp?: number;
}

/**
 * Generates a realistic simulated city drive featuring:
 * 1. Acceleration from a stop
 * 2. Cruising at 50 km/h (13.8 m/s)
 * 3. Waiting at a red light for 30 seconds (idle / stopped time)
 * 4. Turning 90 degrees
 * 5. Cruising at 60 km/h (16.6 m/s)
 * 6. Slowing down to a complete park
 */
export function generateCityDrive(options: CityDriveOptions = {}): GpsPoint[] {
  let currentPos = options.start ?? { lat: 37.7749, lon: -122.4194 };
  let currentTimestamp = options.startTimestamp ?? Date.now();
  let currentBearing = 90; // Starting East

  const points: GpsPoint[] = [];

  const addPoint = (speed: number, durationS: number = 1) => {
    const distanceM = speed * durationS;
    if (distanceM > 0) {
      currentPos = destinationPoint(currentPos, distanceM, currentBearing);
    }
    currentTimestamp += durationS * 1000;
    points.push({
      lat: Number(currentPos.lat.toFixed(7)),
      lon: Number(currentPos.lon.toFixed(7)),
      timestamp: currentTimestamp,
      accuracyM: 4.5 + Math.random() * 2, // 4.5 - 6.5m accuracy
      speedMps: speed,
      mocked: true,
    });
  };

  // Initial parked point
  points.push({
    lat: currentPos.lat,
    lon: currentPos.lon,
    timestamp: currentTimestamp,
    accuracyM: 5.0,
    speedMps: 0,
    mocked: true,
  });

  // Stage 1: Accelerate to 14 m/s over 5 seconds
  for (let s = 1; s <= 5; s++) {
    addPoint((14 / 5) * s);
  }

  // Stage 2: Cruise for 15 seconds
  for (let s = 0; s < 15; s++) {
    addPoint(14);
  }

  // Stage 3: Decelerate to 0 m/s over 4 seconds
  for (let s = 1; s <= 4; s++) {
    addPoint(Math.max(0, 14 - (14 / 4) * s));
  }

  // Stage 4: Red light stop (idle time for 25 seconds at 0 m/s)
  for (let s = 0; s < 25; s++) {
    addPoint(0);
  }

  // Turn North (bearing = 0)
  currentBearing = 0;

  // Stage 5: Accelerate to 18 m/s (~65 km/h) over 6 seconds
  for (let s = 1; s <= 6; s++) {
    addPoint((18 / 6) * s);
  }

  // Stage 6: Cruise for 20 seconds
  for (let s = 0; s < 20; s++) {
    addPoint(18);
  }

  // Stage 7: Decelerate and stop
  for (let s = 1; s <= 5; s++) {
    addPoint(Math.max(0, 18 - (18 / 5) * s));
  }

  return points;
}

/**
 * Generates a drive injected with realistic anomalies:
 * 1. Teleport speed jump (e.g. 50 km jump in 2 seconds)
 * 2. Corrupt out-of-order / backwards timestamp
 * 3. Degraded GPS accuracy (> 60m)
 */
export function generateAnomalyDrive(options: CalibrationDriveOptions = {}): GpsPoint[] {
  const points = generateCalibrationDrive(options);

  // Corrupt point 15: Degraded accuracy
  if (points.length > 15) {
    points[15].accuracyM = 85.0; // Exceeds 50m max threshold
  }

  // Corrupt point 25: Impossible teleport jump (moves 15 km away instantly)
  if (points.length > 25) {
    const teleportCoord = destinationPoint(
      { lat: points[25].lat, lon: points[25].lon },
      15_000, // 15 km in 1 second = 15,000 m/s
      0
    );
    points[25].lat = teleportCoord.lat;
    points[25].lon = teleportCoord.lon;
  }

  // Corrupt point 35: Backwards timestamp
  if (points.length > 35) {
    points[35].timestamp = points[34].timestamp - 5000; // 5 seconds in the past!
  }

  return points;
}

/**
 * Generates a stationary trip where a phone is sitting still for a duration.
 */
export function generateStationaryDrive(durationS: number = 60): GpsPoint[] {
  const origin: LatLon = { lat: 37.7749, lon: -122.4194 };
  const startTimestamp = Date.now();
  const points: GpsPoint[] = [];

  for (let i = 0; i <= durationS; i++) {
    points.push({
      lat: origin.lat,
      lon: origin.lon,
      timestamp: startTimestamp + i * 1000,
      accuracyM: 4.0,
      speedMps: 0,
      mocked: true,
    });
  }

  return points;
}
