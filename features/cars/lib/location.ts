import { distanceKm, type Point } from "@/lib/geo";
import { PLACES } from "@/lib/places";

// Ближайший город к точке GPS — «Noteikt manu atrašanās vietu» в фильтре выбирает его как место.
// Края не берём: человек скорее скажет «я в Сигулде», чем «в Siguldas novads»
export function nearestCity(point: Point) {
  const cities = PLACES.filter((p) => p.kind === "city");
  return cities.reduce((best, p) => (distanceKm(point, p) < distanceKm(point, best) ? p : best)).key;
}
