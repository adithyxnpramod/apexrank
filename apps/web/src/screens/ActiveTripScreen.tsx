import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { computeStats, GpsPoint } from '@apextrack/shared';
import {
  AlertTriangle,
  Clock,
  Flame,
  Navigation,
  Play,
  Square,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { TelemetryStatCard } from '../components/TelemetryStatCard';

type TrackingMode = 'simulated_city' | 'simulated_calibration' | 'simulated_anomaly' | 'device_gps';

export const ActiveTripScreen: React.FC = () => {
  const navigate = useNavigate();

  // Driving State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('simulated_city');
  const [unit, setUnit] = useState<'km/h' | 'mph'>('km/h');
  const [tripId, setTripId] = useState<string | null>(null);

  // Live Telemetry Buffer
  const [points, setPoints] = useState<GpsPoint[]>([]);
  const [currentSpeedMps, setCurrentSpeedMps] = useState<number>(0);
  const [currentAccuracyM, setCurrentAccuracyM] = useState<number>(4.8);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // References for timers and hardware
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const simStepRef = useRef<number>(0);

  // Request Screen Wake Lock when recording
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isRecording) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
        }
      }
    };

    if (isRecording) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      setWakeLockActive(false);
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isRecording]);

  // Start Drive Session
  const handleStartDrive = async () => {
    try {
      setGpsError(null);
      const startedAt = new Date().toISOString();
      const clientTripId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newTrip = await api.createTrip({
        clientTripId,
        startedAt,
        source: trackingMode === 'device_gps' ? 'device' : 'simulated',
        visibility: 'PRIVATE',
      });

      setTripId(newTrip.id);
      setPoints([]);
      setCurrentSpeedMps(0);
      setIsRecording(true);
      simStepRef.current = 0;

      if (trackingMode === 'device_gps') {
        startDeviceGps(newTrip.id);
      } else {
        startSimulation(newTrip.id, trackingMode);
      }
    } catch (err: any) {
      setGpsError(err.message || 'Failed to start driving session');
    }
  };

  // Hardware GPS Watcher
  const startDeviceGps = (activeTripId: string) => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          timestamp: pos.timestamp || Date.now(),
          accuracyM: pos.coords.accuracy,
          speedMps: pos.coords.speed !== null && pos.coords.speed >= 0 ? pos.coords.speed : undefined,
          mocked: false,
        };

        setCurrentAccuracyM(pos.coords.accuracy);
        if (point.speedMps !== undefined) {
          setCurrentSpeedMps(point.speedMps);
        }

        setPoints((prev) => {
          const next = [...prev, point];
          api.uploadPointsBatch(activeTripId, [point]).catch(console.error);
          return next;
        });
      },
      (err) => {
        console.error('GPS watch error:', err);
        setGpsError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  // Telemetry Drive Simulators
  const startSimulation = (activeTripId: string, mode: TrackingMode) => {
    let lat = 37.7749;
    let lon = -122.4194;
    let headingDeg = 90;
    let speed = 0;

    simIntervalRef.current = window.setInterval(() => {
      const step = simStepRef.current;
      simStepRef.current += 1;

      if (mode === 'simulated_city') {
        if (step < 6) {
          speed = (14 / 6) * step;
        } else if (step < 20) {
          speed = 14 + (Math.random() - 0.5) * 1.5;
        } else if (step < 25) {
          speed = Math.max(0, 14 - (14 / 5) * (step - 20));
        } else if (step < 40) {
          speed = 0;
        } else if (step < 46) {
          headingDeg = 0;
          speed = (18 / 6) * (step - 40);
        } else {
          speed = 18 + (Math.random() - 0.5) * 2;
        }
      } else if (mode === 'simulated_calibration') {
        speed = 20;
      } else if (mode === 'simulated_anomaly') {
        if (step === 15) {
          lat += 0.25;
          speed = 950;
        } else {
          speed = 16;
        }
      }

      const distStepM = speed * 1.0;
      if (distStepM > 0) {
        const dLat = (distStepM * Math.cos((headingDeg * Math.PI) / 180)) / 111111;
        const dLon =
          (distStepM * Math.sin((headingDeg * Math.PI) / 180)) /
          (111111 * Math.cos((lat * Math.PI) / 180));
        lat += dLat;
        lon += dLon;
      }

      const point: GpsPoint = {
        lat: Number(lat.toFixed(7)),
        lon: Number(lon.toFixed(7)),
        timestamp: Date.now(),
        accuracyM: 4.5 + Math.random(),
        speedMps: speed,
        mocked: true,
      };

      setCurrentSpeedMps(speed);
      setPoints((prev) => {
        const next = [...prev, point];
        api.uploadPointsBatch(activeTripId, [point]).catch(console.error);
        return next;
      });
    }, 1000);
  };

  const handleStopDrive = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current !== null) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    setIsRecording(false);

    if (tripId) {
      try {
        const finished = await api.finishTrip(tripId);
        navigate(`/trips/${finished.id}`);
      } catch (err: any) {
        setGpsError(err.message || 'Failed to finalize trip');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current !== null) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  const liveStats = computeStats(points);

  const displayDistance =
    unit === 'km/h'
      ? `${(liveStats.distanceM / 1000).toFixed(2)} km`
      : `${(liveStats.distanceM * 0.000621371).toFixed(2)} mi`;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between glass-panel rounded-2xl px-5 py-3 border border-dark-700/80">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              isRecording ? 'bg-apex-emerald animate-ping' : 'bg-slate-500'
            }`}
          />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
            {isRecording ? 'RECORDING ACTIVE TELEMETRY' : 'READY TO DRIVE'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">GPS Accuracy: ±{currentAccuracyM.toFixed(1)}m</span>
          {wakeLockActive && (
            <span className="px-2 py-0.5 rounded bg-apex-emerald/10 text-apex-emerald border border-apex-emerald/20 text-[10px]">
              WAKE LOCK ON
            </span>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="glass-panel border-apex-coral/40 bg-apex-coral/10 text-apex-coral rounded-2xl p-4 flex items-center space-x-3 text-sm font-mono">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      <div className="glass-panel rounded-3xl p-4 sm:p-8 border border-dark-700/80 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-dark-900 to-dark-950">
        <SpeedometerGauge
          speedMps={currentSpeedMps}
          topSpeedMps={liveStats.topSpeedMps}
          unit={unit}
          onToggleUnit={() => setUnit((prev) => (prev === 'km/h' ? 'mph' : 'km/h'))}
        />

        <div className="mt-2 flex items-center space-x-2">
          {currentSpeedMps >= 0.5 ? (
            <span className="px-3 py-1 rounded-full bg-apex-emerald/10 text-apex-emerald text-xs font-mono font-bold border border-apex-emerald/30 animate-pulse">
              MOVING • {currentSpeedMps.toFixed(1)} m/s
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-apex-gold/10 text-apex-gold text-xs font-mono font-bold border border-apex-gold/30">
              IDLE / STOPPED
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <TelemetryStatCard
          label="Distance"
          value={displayDistance}
          subValue={`${points.length} GPS pings`}
          icon={Navigation}
          variant="cyan"
        />

        <TelemetryStatCard
          label="Duration"
          value={formatSeconds(liveStats.durationS)}
          subValue="Elapsed wall time"
          icon={Clock}
          variant="violet"
        />

        <TelemetryStatCard
          label="Moving Time"
          value={formatSeconds(liveStats.movingTimeS)}
          subValue={`Idle: ${formatSeconds(liveStats.idleTimeS)}`}
          icon={Zap}
          variant="emerald"
        />

        <TelemetryStatCard
          label="Avg Speed"
          value={
            unit === 'km/h'
              ? `${(liveStats.avgSpeedMps * 3.6).toFixed(1)}`
              : `${(liveStats.avgSpeedMps * 2.23694).toFixed(1)}`
          }
          unit={unit}
          subValue="Moving pace"
          icon={Flame}
          variant="gold"
        />
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-dark-700/80 space-y-4">
        {!isRecording ? (
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Select Telemetry Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {[
                { id: 'simulated_city', label: 'City Drive', desc: 'Cruising & red lights' },
                { id: 'simulated_calibration', label: '1km Calibration', desc: 'Exact 20 m/s straight line' },
                { id: 'simulated_anomaly', label: 'Anomaly Spikes', desc: 'Tests teleport anti-cheat' },
                { id: 'device_gps', label: 'Live Device GPS', desc: 'Browser GPS receiver' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTrackingMode(m.id as TrackingMode)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    trackingMode === m.id
                      ? 'bg-dark-800 border-apex-cyan text-white shadow-sm'
                      : 'bg-dark-900/60 border-dark-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{m.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleStartDrive}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-apex-cyan via-apex-blue to-apex-violet text-dark-950 font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-glow flex items-center justify-center space-x-3"
            >
              <Play className="w-5 h-5 fill-dark-950" />
              <span>START DRIVE RECORDING</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="font-mono text-xs text-slate-400 block">
                Session Active • Points Buffered: {points.length}
              </span>
              <span className="font-bold text-sm text-slate-200">
                Drive normally. All SI metrics are computed live.
              </span>
            </div>

            <button
              onClick={handleStopDrive}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-apex-coral text-white font-black text-base hover:bg-red-600 active:scale-95 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>STOP DRIVE & FINISH</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
