export function pagination(searchParams: URLSearchParams) {
  const rawPage = Number(searchParams.get("page")); const rawLimit = Number(searchParams.get("limit"));
  return { page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1, limit: Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.floor(rawLimit)) : 50 };
}
