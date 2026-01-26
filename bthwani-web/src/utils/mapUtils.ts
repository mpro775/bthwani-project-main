export type LatLng = { lat: number; lng: number };

export async function reverseGeocode(latlng: LatLng, apiKey: string): Promise<string> {
  // Simple reverse geocoding via Google Maps Geocoding API
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng.lat},${latlng.lng}&language=ar&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    return json?.results?.[0]?.formatted_address || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
  } catch {
    return `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
  }
}
