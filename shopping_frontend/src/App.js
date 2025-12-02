import React, { useEffect, useState } from 'react';
import { fetchProducts, getApiBaseUrl } from './api';

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

function ProductCard({ title }) {
  return (
    <div className="card">
      <div style={{height:120,background:'#f3f4f6',borderRadius:8,marginBottom:12}} />
      <h3 style={{margin:'4px 0 12px'}}>{title}</h3>
      <button className="button">Add to Cart</button>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lazy load products when user clicks the button so the UI renders even if backend is offline.
  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder items for initial render
  const placeholders = Array.from({ length: 6 }).map((_, i) => ({
    id: `ph-${i}`,
    title: `Product ${i + 1}`
  }));

  return (
    <>
      <Header />
      <main className="container" style={{paddingTop:24}}>
        <div className="card" style={{marginBottom:16}}>
          <p style={{margin:0}}>
            Backend API: <code>{getApiBaseUrl()}</code>
          </p>
          <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="button" onClick={loadProducts} disabled={loading}>
              {loading ? 'Loading…' : 'Load Products from Backend'}
            </button>
            {error && <span style={{color:'#EF4444'}}>Error: {error}</span>}
          </div>
        </div>

        <div className="grid">
          {(products || placeholders).map((p) => (
            <ProductCard key={p.id || p.title} title={p.title || p.name || 'Product'} />
          ))}
        </div>
      </main>
      <footer className="container" style={{padding:'24px 16px', opacity:0.8}}>
        <small>© {new Date().getFullYear()} Simple Shop</small>
      </footer>
    </>
  );
}
