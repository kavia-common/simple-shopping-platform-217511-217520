import React, { useEffect, useState } from 'react';
import { getProducts, getApiBaseUrl } from './api';

/**
 * Header component with Ocean Professional theme accents.
 */
function Header() {
  return (
    <header className="header" role="banner">
      <div className="container header__bar">
        <div className="brand">
          <div className="brand__dot" aria-hidden="true" />
          <h1 className="brand__title">Simple Shop</h1>
        </div>
        <nav aria-label="Primary">
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="button" type="button">
              Products
            </button>
            <button className="button button--secondary" type="button">
              Cart
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

/**
 * PUBLIC_INTERFACE
 * ProductCard
 * Renders an individual product in a themed card.
 */
function ProductCard({ name, price }) {
  /** This is a public function. */
  return (
    <article className="card card--elevated" aria-label={name}>
      <div className="card__media" aria-hidden="true" />
      <h3 style={{ margin: '4px 0 8px' }}>{name}</h3>
      <div className="price">
        {price != null ? `$${Number(price).toFixed(2)}` : ''}
      </div>
      <button className="button button--secondary" type="button">
        Add to Cart
      </button>
    </article>
  );
}

/**
 * App root that fetches products and renders themed UI.
 */
export default function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load products on initial mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProducts();
        if (isMounted) setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to load products');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 24 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            Backend API: <code>{getApiBaseUrl() === '' ? '(same-origin)' : getApiBaseUrl()}</code>
          </p>
        </div>

        {loading && (
          <div className="banner banner--info banner--loading" role="status" aria-live="polite" style={{ marginBottom: 16 }}>
            <span className="spinner" aria-hidden="true" />
            <span>Loading products…</span>
          </div>
        )}

        {error && (
          <div className="banner banner--error" role="alert" style={{ marginBottom: 16 }}>
            <strong style={{ marginRight: 8 }}>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="banner banner--info" role="status" aria-live="polite" style={{ marginBottom: 16 }}>
            <span>No products available.</span>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <section aria-label="Products" className="grid">
            {products.map((p) => (
              <ProductCard
                key={p.id || p._id || p.name}
                name={p.name || p.title || 'Product'}
                price={p.price}
              />
            ))}
          </section>
        )}
      </main>
      <footer className="container footer">
        <small className="muted">© {new Date().getFullYear()} Simple Shop</small>
      </footer>
    </>
  );
}
