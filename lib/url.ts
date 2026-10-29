// Адрес с изменёнными параметрами запроса: пустое значение удаляет параметр.
// withQuery("/cars", params, { page: "2" }) → «/cars?brand=audi&page=2»
export function withQuery(
  path: string,
  current: { toString(): string },
  changes: Record<string, string | null | undefined>
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}
