export interface Place {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
}

export interface Review {
  text: string;
  rating?: number;
  author_name?: string;
}

export interface PlaceWithReviews extends Place {
  reviews?: Review[];
}

export interface AnalysisResult {
  pros: string[];
  cons: string[];
}

export interface ComparisonItem {
  place: PlaceWithReviews;
  analysis: AnalysisResult | null;
  loading?: boolean;
}
