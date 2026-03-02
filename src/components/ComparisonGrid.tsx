"use client";

import { ComparisonCard } from "./ComparisonCard";
import type { ComparisonItem } from "@/lib/types";

export interface ComparisonGridProps {
  items: ComparisonItem[];
}

export function ComparisonGrid({ items }: ComparisonGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <ComparisonCard
          key={item.place.place_id}
          place={item.place}
          analysis={item.analysis}
          loading={item.loading}
        />
      ))}
    </div>
  );
}
