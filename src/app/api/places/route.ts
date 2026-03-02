import { NextRequest, NextResponse } from "next/server";
import type { Place, PlaceWithReviews, Review } from "@/lib/types";

const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  if (action === "geocode") {
    const address = searchParams.get("address");
    if (!address?.trim()) {
      return NextResponse.json(
        { error: "address required for geocode" },
        { status: 400 }
      );
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.trim())}&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        { error: data.error_message || "Address not found" },
        { status: 400 }
      );
    }
    const loc = data.results[0].geometry?.location;
    if (!loc) {
      return NextResponse.json({ error: "No location" }, { status: 400 });
    }
    return NextResponse.json({ lat: loc.lat, lng: loc.lng });
  }

  if (action === "nearby") {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng required for nearby search" },
        { status: 400 }
      );
    }
    const location = `${lat},${lng}`;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        { error: data.error_message || data.status },
        { status: 400 }
      );
    }
    const places: Place[] = (data.results || []).map((r: Record<string, unknown>) => ({
      place_id: r.place_id as string,
      name: r.name as string,
      vicinity: r.vicinity as string,
      rating: r.rating as number | undefined,
      user_ratings_total: r.user_ratings_total as number | undefined,
      geometry: r.geometry as { location: { lat: number; lng: number } } | undefined,
    }));
    return NextResponse.json(places);
  }

  if (action === "details") {
    const placeId = searchParams.get("place_id");
    if (!placeId) {
      return NextResponse.json(
        { error: "place_id required for details" },
        { status: 400 }
      );
    }
    const fields = "name,formatted_address,rating,reviews,user_ratings_total,geometry";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK") {
      return NextResponse.json(
        { error: data.error_message || data.status },
        { status: 400 }
      );
    }
    const r = data.result;
    const reviews: Review[] = (r.reviews || []).map((rev: Record<string, unknown>) => ({
      text: (rev.text as string) || "",
      rating: rev.rating as number | undefined,
      author_name: rev.author_name as string | undefined,
    }));
    const place: PlaceWithReviews = {
      place_id: r.place_id,
      name: r.name,
      formatted_address: r.formatted_address,
      vicinity: r.vicinity,
      rating: r.rating,
      user_ratings_total: r.user_ratings_total,
      geometry: r.geometry,
      reviews,
    };
    return NextResponse.json(place);
  }

  return NextResponse.json(
    { error: "action must be 'geocode', 'nearby', or 'details'" },
    { status: 400 }
  );
}
