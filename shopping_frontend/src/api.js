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
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
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
  return res.json();
}
