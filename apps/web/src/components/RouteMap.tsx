import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Layers, Map as MapIcon, Satellite } from 'lucide-react';

export type MapTileTheme = 'dark' | 'streets' | 'satellite';

interface RouteMapProps {
  routeGeoJson?: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat]
  };
  liveLocation?: [number, number]; // [lon, lat] for real-time tracking
  className?: string;
  interactive?: boolean;
  followLive?: boolean;
  defaultTheme?: MapTileTheme;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routeGeoJson,
  liveLocation,
  className = 'h-80 w-full',
  interactive = true,
  followLive = true,
  defaultTheme = 'dark',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const liveMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [activeTheme, setActiveTheme] = useState<MapTileTheme>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize MapLibre with multi-source raster configuration
  // Uses 100% keyless, public, production-grade GIS & OSM tile endpoints
  useEffect(() => {
    if (!mapContainer.current) return;

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-dark': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '&copy; Esri, HERE, Garmin',
          maxzoom: 16,
        },
        'esri-dark-labels': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 16,
        },
        'osm-streets': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
          maxzoom: 19,
        },
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '&copy; Esri World Imagery',
          maxzoom: 18,
        },
      },
      layers: [
        {
          id: 'base-dark-layer',
          type: 'raster',
          source: 'esri-dark',
          minzoom: 0,
          maxzoom: 20,
          layout: { visibility: defaultTheme === 'dark' ? 'visible' : 'none' },
        },
        {
          id: 'base-dark-labels',
          type: 'raster',
          source: 'esri-dark-labels',
          minzoom: 0,
          maxzoom: 20,
          layout: { visibility: defaultTheme === 'dark' ? 'visible' : 'none' },
        },
        {
          id: 'base-osm-layer',
          type: 'raster',
          source: 'osm-streets',
          minzoom: 0,
          maxzoom: 20,
          layout: { visibility: defaultTheme === 'streets' ? 'visible' : 'none' },
        },
        {
          id: 'base-sat-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 20,
          layout: { visibility: defaultTheme === 'satellite' ? 'visible' : 'none' },
        },
      ],
    };

    const initialCenter: [number, number] =
      liveLocation ??
      routeGeoJson?.coordinates?.[0] ??
      [-122.4194, 37.7749];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: initialCenter,
      zoom: liveLocation ? 15 : 12,
      interactive,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    if (interactive) {
      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'top-right'
      );
    }

    map.current.on('load', () => {
      setIsLoaded(true);
      if (!map.current) return;

      const coords = routeGeoJson?.coordinates ?? [];

      // Add route line GeoJSON source
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        },
      });

      // Neon Glow background casing
      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#00F0FF',
          'line-width': 8,
          'line-opacity': 0.4,
          'line-blur': 4,
        },
      });

      // Main Route Polyline
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#00F0FF',
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });

      if (coords.length > 0) {
        // Start Marker (Emerald)
        const startCoord = coords[0];
        const startEl = document.createElement('div');
        startEl.className =
          'w-4 h-4 rounded-full bg-apex-emerald border-2 border-white shadow-glow-emerald';
        new maplibregl.Marker({ element: startEl })
          .setLngLat(startCoord)
          .addTo(map.current);

        // End Marker (Coral)
        if (coords.length > 1) {
          const endCoord = coords[coords.length - 1];
          const endEl = document.createElement('div');
          endEl.className =
            'w-4 h-4 rounded-full bg-apex-coral border-2 border-white shadow-md';
          new maplibregl.Marker({ element: endEl })
            .setLngLat(endCoord)
            .addTo(map.current);

          // Fit bounds
          const bounds = new maplibregl.LngLatBounds();
          coords.forEach((coord) => bounds.extend(coord));
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 16,
            duration: 1000,
          });
        }
      }
    });

    return () => {
      liveMarkerRef.current?.remove();
      map.current?.remove();
      setIsLoaded(false);
    };
  }, []);

  // Update route polyline data dynamically
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const source = map.current.getSource('route') as maplibregl.GeoJSONSource | undefined;
    if (source && routeGeoJson) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: routeGeoJson,
      });

      // If interactive trip detail, auto-fit bounds on data arrival
      if (routeGeoJson.coordinates.length > 1 && !liveLocation) {
        const bounds = new maplibregl.LngLatBounds();
        routeGeoJson.coordinates.forEach((coord) => bounds.extend(coord));
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
          duration: 800,
        });
      }
    }
  }, [routeGeoJson, isLoaded]);

  // Update live vehicle marker position
  useEffect(() => {
    if (!map.current || !liveLocation) return;

    if (!liveMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <span class="absolute w-8 h-8 rounded-full bg-apex-cyan/30 animate-ping"></span>
        <span class="w-4 h-4 rounded-full bg-apex-cyan border-2 border-white shadow-glow"></span>
      `;
      liveMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(liveLocation)
        .addTo(map.current);
    } else {
      liveMarkerRef.current.setLngLat(liveLocation);
    }

    if (followLive && map.current) {
      map.current.easeTo({
        center: liveLocation,
        duration: 500,
      });
    }
  }, [liveLocation, followLive, isLoaded]);

  // Handle tile theme switching
  const switchTheme = (theme: MapTileTheme) => {
    setActiveTheme(theme);
    if (!map.current || !isLoaded) return;

    map.current.setLayoutProperty(
      'base-dark-layer',
      'visibility',
      theme === 'dark' ? 'visible' : 'none'
    );
    map.current.setLayoutProperty(
      'base-dark-labels',
      'visibility',
      theme === 'dark' ? 'visible' : 'none'
    );
    map.current.setLayoutProperty(
      'base-osm-layer',
      'visibility',
      theme === 'streets' ? 'visible' : 'none'
    );
    map.current.setLayoutProperty(
      'base-sat-layer',
      'visibility',
      theme === 'satellite' ? 'visible' : 'none'
    );
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-dark-700/60 ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Map Theme Selector */}
      <div className="absolute top-3 left-3 z-10 flex items-center bg-dark-900/90 backdrop-blur-md rounded-xl p-1 border border-dark-700/80 shadow-lg text-xs font-mono">
        <button
          type="button"
          onClick={() => switchTheme('dark')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
            activeTheme === 'dark'
              ? 'bg-apex-cyan text-dark-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Esri Dark GIS Basemap (Keyless)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => switchTheme('streets')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
            activeTheme === 'streets'
              ? 'bg-apex-cyan text-dark-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="OpenStreetMap Standard (Free / Open)"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Streets</span>
        </button>

        <button
          type="button"
          onClick={() => switchTheme('satellite')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
            activeTheme === 'satellite'
              ? 'bg-apex-cyan text-dark-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Esri Satellite Imagery"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
      </div>

      {(!routeGeoJson || !routeGeoJson.coordinates?.length) && !liveLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm text-slate-400 font-mono text-sm">
          No GPS Route Coordinates Available
        </div>
      )}
    </div>
  );
};
