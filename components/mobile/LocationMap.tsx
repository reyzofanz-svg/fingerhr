"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  spots: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>;
  isInSpot: boolean;
}

export function LocationMap({ userLocation, spots, isInSpot }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on first spot or user location
    const center = userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : spots.length > 0
      ? [spots[0].latitude, spots[0].longitude]
      : [-7.011299, 110.4437126];

    const map = L.map(mapRef.current, {
      center: center as [number, number],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Add dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when location or spots change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add spot markers with radius circles
    spots.forEach((spot) => {
      // Circle for radius
      L.circle([spot.latitude, spot.longitude], {
        radius: spot.radius,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.5,
      }).addTo(map);

      // Spot marker
      const spotIcon = L.divIcon({
        html: `<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([spot.latitude, spot.longitude], { icon: spotIcon })
        .addTo(map)
        .bindPopup(`<div style="color: black; font-weight: 500;">${spot.name}</div>`);
    });

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="background: ${isInSpot ? "#22c55e" : "#ef4444"}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${isInSpot ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"}; animation: pulse 2s infinite;"></div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        </style>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<div style="color: black; font-weight: 500;">Lokasi Anda</div>`);

      // Fit map to show user and nearest spot
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        ...spots.map((s) => [s.latitude, s.longitude] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, spots, isInSpot]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div ref={mapRef} className="h-48 w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] text-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Area absensi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isInSpot ? "bg-green-500" : "bg-red-500"}`} />
          <span>Lokasi Anda</span>
        </div>
      </div>
    </div>
  );
}
