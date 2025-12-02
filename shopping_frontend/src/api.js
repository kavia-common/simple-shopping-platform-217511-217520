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
 * fetchProducts
 * Simple helper that fetches products from the backend /products endpoint.
 * Returns JSON or throws on network errors.
 */
export async function fetchProducts() {
  /** This is a public function. */
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}
