/**
 * PUBLIC_INTERFACE
 * getApiBaseUrl
 * This returns the base URL for the backend API.
 * Priority:
 * 1) REACT_APP_API_BASE_URL env variable
 * 2) Default: http://localhost:3001
 */
export function getApiBaseUrl() {
  /** This is a public function. */
  // Prefer environment override when provided.
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // Fallback: same-origin relative base to avoid cross-origin in preview environments.
  // This lets the app call "/api/..." which can be proxied in development to the backend.
  return '';
}

/**
 * PUBLIC_INTERFACE
 * getProducts
 * Fetches products from the backend /api/products endpoint and returns JSON.
 * Throws an Error on HTTP/network failure.
 */
export async function getProducts() {
  /** This is a public function. */
  const base = getApiBaseUrl();
  const url = `${base}/api/products`;
  const res = await fetch(url, {
    headers: {
      // If backend enforces CORS, ensure it includes appropriate Access-Control-Allow-Origin.
      // Frontend does not need special headers here for a simple GET.
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch products (${res.status}): ${text || res.statusText}`);
  }
  // The backend returns either an array of products or an object with { items, count }.
  // Normalize to always return an array for the UI.
  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  // Fallback: return empty array if shape is unexpected
  return [];
}
