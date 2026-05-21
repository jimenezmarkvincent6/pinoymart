import { branches, type Branch } from "@/data/branches";

const EARTH_RADIUS_KM = 6371;

/** Haversine great-circle distance in kilometers. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface NearestResult {
  branch: Branch;
  distanceKm: number;
}

export function findNearestBranch(coords: {
  lat: number;
  lng: number;
}): NearestResult {
  let best: NearestResult | null = null;
  for (const branch of branches) {
    const distanceKm = haversineKm(coords, branch);
    if (!best || distanceKm < best.distanceKm) {
      best = { branch, distanceKm };
    }
  }
  return best!; // branches array is non-empty
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Browser geolocation as a Promise. Resolves with coords on success;
 * rejects on denial / unavailable / timeout.
 */
export function requestUserLocation(
  options: PositionOptions = { timeout: 8000, enableHighAccuracy: false }
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      options
    );
  });
}
