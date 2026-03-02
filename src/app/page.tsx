"use client";

import { useCallback, useState } from "react";
import { Map } from "@/components/Map";
import { LocationSearch } from "@/components/LocationSearch";
import { PlaceList } from "@/components/PlaceList";
import { ComparisonGrid } from "@/components/ComparisonGrid";
import { DEFAULT_CENTER } from "@/lib/utils";
import type {
  Place,
  PlaceWithReviews,
  AnalysisResult,
  ComparisonItem,
} from "@/lib/types";

export default function Home() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(
    new Set()
  );
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [comparing, setComparing] = useState(false);

  const handleSearch = useCallback(
    async (lat: number, lng: number) => {
      setCenter({ lat, lng });
      setSearching(true);
      setComparisonItems([]);
      try {
        const res = await fetch(
          `/api/places?action=nearby&lat=${lat}&lng=${lng}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Search failed");
        }
        const data = await res.json();
        setPlaces(data);
        setSelectedPlaceIds(new Set());
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const handleTogglePlace = useCallback((place: Place) => {
    setSelectedPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(place.place_id)) {
        next.delete(place.place_id);
      } else if (next.size < 4) {
        next.add(place.place_id);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(async () => {
    const selected = places.filter((p) => selectedPlaceIds.has(p.place_id));
    if (selected.length === 0) return;
    setComparing(true);
    const items: ComparisonItem[] = selected.map((p) => ({
      place: { ...p, reviews: [] },
      analysis: null,
      loading: true,
    }));
    setComparisonItems(items);

    const results: ComparisonItem[] = [];
    for (let i = 0; i < selected.length; i++) {
      const place = selected[i];
      try {
        const detailsRes = await fetch(
          `/api/places?action=details&place_id=${encodeURIComponent(place.place_id)}`
        );
        if (!detailsRes.ok) {
          results.push({
            place: { ...place, reviews: [] },
            analysis: null,
            loading: false,
          });
          continue;
        }
        const placeWithReviews: PlaceWithReviews = await detailsRes.json();

        const reviews = placeWithReviews.reviews ?? [];
        let analysis: AnalysisResult = { pros: [], cons: [] };
        if (reviews.length > 0) {
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              placeName: placeWithReviews.name,
              reviews: reviews.map((r) => ({ text: r.text, rating: r.rating })),
            }),
          });
          if (analyzeRes.ok) {
            analysis = await analyzeRes.json();
          }
        }

        results.push({
          place: placeWithReviews,
          analysis,
          loading: false,
        });
      } catch {
        results.push({
          place: { ...place, reviews: [] },
          analysis: null,
          loading: false,
        });
      }
      setComparisonItems([...results]);
    }
    setComparing(false);
  }, [places, selectedPlaceIds]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          SpotCompare
        </h1>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
          Search nearby restaurants, select up to 4, and compare pros and cons.
        </p>
        <div className="mt-3">
          <LocationSearch onSearch={handleSearch} disabled={searching} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <section className="flex flex-col gap-3 lg:w-1/3">
          <div className="h-[280px] min-h-[280px] lg:h-[360px]">
            <Map
              center={center}
              places={places}
              selectedPlaceIds={selectedPlaceIds}
              onPlaceSelect={handleTogglePlace}
            />
          </div>
          <PlaceList
            places={places}
            selectedPlaceIds={selectedPlaceIds}
            onTogglePlace={handleTogglePlace}
            onCompare={handleCompare}
            comparing={comparing}
          />
        </section>

        <section className="flex-1">
          {comparisonItems.length > 0 && (
            <>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Comparison
              </h2>
              <ComparisonGrid items={comparisonItems} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
