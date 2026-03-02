"use client";

import { useMemo } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import type { Place } from "@/lib/types";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 37.7749, lng: -122.4194 };

export interface MapProps {
  center: { lat: number; lng: number };
  places: Place[];
  selectedPlaceIds: Set<string>;
  onPlaceSelect?: (place: Place) => void;
}

export function Map({
  center,
  places,
  selectedPlaceIds,
  onPlaceSelect,
}: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const mapCenter = useMemo(
    () => (center.lat && center.lng ? center : defaultCenter),
    [center.lat, center.lng]
  );

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Failed to load map. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-zinc-500">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={14}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
        }}
      >
        {places.map((place) => {
          const loc = place.geometry?.location;
          if (!loc) return null;
          const isSelected = selectedPlaceIds.has(place.place_id);
          return (
            <Marker
              key={place.place_id}
              position={loc}
              onClick={() => onPlaceSelect?.(place)}
              options={{
                opacity: isSelected ? 1 : 0.8,
                zIndex: isSelected ? 100 : 1,
              }}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}
