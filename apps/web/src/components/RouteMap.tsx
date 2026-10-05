import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

interface RouteMapProps {
  routeGeoJson?: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat]
  };
  className?: string;
  interactive?: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routeGeoJson,
  className = 'h-80 w-full',
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use free CARTO Dark Matter raster tiles (No API key needed)
    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };

    const initialCenter: [number, number] =
      routeGeoJson?.coordinates?.[0] ?? [-122.4194, 37.7749];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: initialCenter,
      zoom: 12,
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
      if (!map.current || !routeGeoJson || !routeGeoJson.coordinates.length) return;

      const coords = routeGeoJson.coordinates;

      // Add route line source
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeGeoJson,
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
          'line-opacity': 0.35,
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

      // Start Marker (Emerald circle)
      const startCoord = coords[0];
      const startEl = document.createElement('div');
      startEl.className =
        'w-4 h-4 rounded-full bg-apex-emerald border-2 border-white shadow-glow-emerald';
      new maplibregl.Marker({ element: startEl })
        .setLngLat(startCoord)
        .addTo(map.current);

      // End Marker (Coral circle) if multiple points
      if (coords.length > 1) {
        const endCoord = coords[coords.length - 1];
        const endEl = document.createElement('div');
        endEl.className =
          'w-4 h-4 rounded-full bg-apex-coral border-2 border-white shadow-md';
        new maplibregl.Marker({ element: endEl })
          .setLngLat(endCoord)
          .addTo(map.current);
      }

      // Auto-fit bounds
      if (coords.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        coords.forEach((coord) => bounds.extend(coord));
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
          duration: 1000,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [routeGeoJson, interactive]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-dark-700/60 ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      {(!routeGeoJson || !routeGeoJson.coordinates?.length) && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm text-slate-400 font-mono text-sm">
          No GPS Route Coordinates Available
        </div>
      )}
    </div>
  );
};
