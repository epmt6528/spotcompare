"use client";

import type { Place } from "@/lib/types";

const MAX_SELECTION = 4;

export interface PlaceListProps {
  places: Place[];
  selectedPlaceIds: Set<string>;
  onTogglePlace: (place: Place) => void;
  onCompare: () => void;
  comparing?: boolean;
}

export function PlaceList({
  places,
  selectedPlaceIds,
  onTogglePlace,
  onCompare,
  comparing = false,
}: PlaceListProps) {
  const selectedCount = selectedPlaceIds.size;
  const canCompare = selectedCount >= 1 && selectedCount <= MAX_SELECTION;

  if (places.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Search for a location to see nearby restaurants. Select up to {MAX_SELECTION} to compare.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {selectedCount} of {MAX_SELECTION} selected
        </p>
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare || comparing}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {comparing ? "Comparing…" : "Compare"}
        </button>
      </div>
      <ul className="flex max-h-[320px] flex-col gap-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {places.map((place) => {
          const isSelected = selectedPlaceIds.has(place.place_id);
          return (
            <li key={place.place_id}>
              <button
                type="button"
                onClick={() => onTogglePlace(place)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-zinc-200 dark:bg-zinc-700"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {place.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {place.vicinity ?? place.formatted_address ?? ""}
                  {place.rating != null && ` · ${place.rating}★`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
