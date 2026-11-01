const cache = new Map();

export async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const a = data.address || {};

  const area = a.suburb || a.neighbourhood || a.residential || a.road || "";
  const city = a.city || a.town || a.village || a.county || "";
  const state = a.state || "";
  const full = [area, city, state].filter(Boolean).join(", ");

  const result = { area, city, state, full, displayName: data.display_name || full };
  cache.set(key, result);
  return result;
}