/**
 * Resolve API base URL.
 * Priority:
 *  1) REACT_APP_API_BASE env (preferred)
 *  2) REACT_APP_BACKEND_URL env (alias; may include /api already)
 *  3) window.__API_BASE__ global (optional override)
 *  4) Derive from current location -> same protocol/host, backend port 3001, path /api
 * Falls back to http://localhost:3001/api for non-browser/test contexts.
 */
function resolveApiBase() {
  const candidates = [
    process.env.REACT_APP_API_BASE,
    process.env.REACT_APP_BACKEND_URL
  ].filter(Boolean);

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const v = c.trim().replace(/\/+$/, '');
      return v.endsWith('/api') ? v : `${v}/api`;
    }
  }

  // Use a global if provided (can be injected by hosting)
  if (typeof window !== 'undefined' && window.__API_BASE__) {
    return String(window.__API_BASE__).trim().replace(/\/+$/, '');
  }

  // Derive from current window location in browser/runtime
  if (typeof window !== 'undefined' && window.location) {
    try {
      const { protocol, hostname } = window.location;
      // Always target backend port 3001 in this project (TLS is terminated by proxy)
      const base = `${protocol}//${hostname}:3001/api`;
      return base.replace(/\/+$/, '');
    } catch {
      // ignore and fall through
    }
  }

  // Safe fallback for tests/local
  return 'http://localhost:3001/api';
}

const API_BASE = resolveApiBase();

async function http(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

// PUBLIC_INTERFACE
export const Api = {
  /** List products */
  products: () => http('GET', '/products'),

  /** Get product details */
  product: (id) => http('GET', `/products/${id}`),

  /** Signup and return {user, token} */
  signup: (email, password) => http('POST', '/auth/signup', { email, password }),

  /** Login and return {user, token} */
  login: (email, password) => http('POST', '/auth/login', { email, password }),

  /** Get cart for current user */
  cart: (token) => http('GET', '/cart', undefined, token),

  /** Add item to cart */
  addToCart: (token, product_id, quantity) => http('POST', '/cart/items', { product_id, quantity }, token),

  /** Update cart item quantity (<=0 removes) */
  updateCart: (token, product_id, quantity) => http('PUT', '/cart/items', { product_id, quantity }, token),

  /** Remove cart item */
  removeFromCart: (token, product_id) => http('DELETE', `/cart/items/${product_id}`, undefined, token),

  /** Create order from cart */
  createOrder: (token) => http('POST', '/orders', undefined, token),

  /** Get order details */
  order: (token, order_id) => http('GET', `/orders/${order_id}`, undefined, token),
};
