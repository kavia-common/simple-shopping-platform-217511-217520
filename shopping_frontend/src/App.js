import React, { useEffect, useState } from 'react';
import { getProducts, getApiBaseUrl } from './api';

function Header() {
  return (
    <header className="header">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'#2563EB'}} />
          <h1 style={{margin:0,fontSize:20}}>Simple Shop</h1>
        </div>
        <nav style={{display:'flex',gap:12}}>
          <button className="button" style={{background:'#2563EB'}}>Products</button>
          <button className="button" style={{background:'#F59E0B'}}>Cart</button>
        </nav>
      </div>
    </header>
  );
}

function ProductCard({ name, price }) {
  return (
    <div className="card">
      <div style={{height:120,background:'#f3f4f6',borderRadius:8,marginBottom:12}} />
      <h3 style={{margin:'4px 0 8px'}}>{name}</h3>
      <div style={{marginBottom:12, opacity:0.8}}>{price != null ? `$${Number(price).toFixed(2)}` : ''}</div>
      <button className="button">Add to Cart</button>
    </div>
  );
}

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
      <main className="container" style={{paddingTop:24}}>
        <div className="card" style={{marginBottom:16}}>
          <p style={{margin:0}}>
            Backend API: <code>{getApiBaseUrl()}</code>
          </p>
        </div>

        {loading && (
          <div className="card" style={{marginBottom:16}}>
            <span>Loading products…</span>
          </div>
        )}

        {error && (
          <div className="card" style={{marginBottom:16, color:'#EF4444'}}>
            Error: {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="card" style={{marginBottom:16}}>
            <span>No products available.</span>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid">
            {products.map((p) => (
              <ProductCard
                key={p.id || p._id || p.name}
                name={p.name || p.title || 'Product'}
                price={p.price}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="container" style={{padding:'24px 16px', opacity:0.8}}>
        <small>© {new Date().getFullYear()} Simple Shop</small>
      </footer>
    </>
  );
}
