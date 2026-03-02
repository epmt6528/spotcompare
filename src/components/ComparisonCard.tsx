"use client";

import type { PlaceWithReviews, AnalysisResult } from "@/lib/types";

export interface ComparisonCardProps {
  place: PlaceWithReviews;
  analysis: AnalysisResult | null;
  loading?: boolean;
}

export function ComparisonCard({
  place,
  analysis,
  loading = false,
}: ComparisonCardProps) {
  const address = place.formatted_address ?? place.vicinity ?? "";

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {place.name}
        </h3>
        {place.rating != null && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {place.rating}★
            {place.user_ratings_total != null &&
              ` (${place.user_ratings_total} reviews)`}
          </p>
        )}
        {address && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {address}
          </p>
        )}
      </header>
      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        )}
        {!loading && analysis && (
          <>
            {analysis.pros.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Pros
                </h4>
                <ul className="space-y-1">
                  {analysis.pros.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.cons.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Cons
                </h4>
                <ul className="space-y-1">
                  {analysis.cons.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-0.5 text-amber-600 dark:text-amber-400">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.pros.length === 0 && analysis.cons.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No pros/cons extracted from reviews.
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}
