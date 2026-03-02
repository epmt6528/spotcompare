"use client";

import { useCallback, useRef, useState } from "react";

export interface LocationSearchProps {
  onSearch: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export function LocationSearch({ onSearch, disabled }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const geocode = useCallback(
    async (address: string) => {
      if (!address.trim()) return;
      setStatus("loading");
      setErrorMessage("");
      try {
        const res = await fetch(
          `/api/places?action=geocode&address=${encodeURIComponent(address.trim())}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Geocode failed");
        }
        const data = await res.json();
        if (data.lat == null || data.lng == null) {
          throw new Error("Address not found");
        }
        onSearch(data.lat, data.lng);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Search failed");
      }
    },
    [onSearch]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation not supported");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSearch(pos.coords.latitude, pos.coords.longitude);
        setStatus("idle");
      },
      () => {
        setStatus("error");
        setErrorMessage("Could not get your location");
      }
    );
  }, [onSearch]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      geocode(query);
    },
    [query, geocode]
  );

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city or address"
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || status === "loading"}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "loading" ? "Searching…" : "Search"}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={disabled || status === "loading"}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Use my location
        </button>
      </form>
      {status === "error" && errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
