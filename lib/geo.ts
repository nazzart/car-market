export type Point = { lat: number; lng: number };

// Центры городов из списка (messages → options.cities)
export const CITY_COORDS: Record<string, Point> = {
  riga: { lat: 56.9496, lng: 24.1052 },
  jurmala: { lat: 56.968, lng: 23.7704 },
  jelgava: { lat: 56.6511, lng: 23.7214 },
  daugavpils: { lat: 55.8714, lng: 26.5161 },
  liepaja: { lat: 56.5047, lng: 21.0108 },
  ogre: { lat: 56.8162, lng: 24.614 },
  valmiera: { lat: 57.5385, lng: 25.4264 },
  ventspils: { lat: 57.3894, lng: 21.5606 },
};

// Расстояние по прямой, км (формула гаверсинусов)
export function distanceKm(a: Point, b: Point) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
