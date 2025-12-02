import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Api } from './api';
import { Header, Card, buttonStyle, theme } from './ui';

// PUBLIC_INTERFACE
function App() {
  /** Minimal SPA with internal "routes": products | cart | orders | auth */
  const [route, setRoute] = useState('products'); // home route
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // cache for client-side filtering fallback
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ id: 'all', slug: 'all', name: 'All' });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const isAuthed = !!token;
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const cartCount = useMemo(() => cart.items.reduce((a, i) => a + i.quantity, 0), [cart]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');

  useEffect(() => {
    // Fetch categories on app load
    Api.categories()
      .then((cats) => {
        const base = [{ id: 'all', slug: 'all', name: 'All' }];
        const list = Array.isArray(cats) ? cats : [];
        setCategories([...base, ...list]);
      })
      .catch((e) => {
        console.error(e);
        // In case of failure, still provide basic options
        setCategories([{ id: 'all', slug: 'all', name: 'All' }]);
      });
  }, []);

  useEffect(() => {
    // Fetch products (optionally filtered by category)
    setLoadingProducts(true);
    setErrorProducts('');
    const opts =
      category && category.id !== 'all'
        ? (category.slug && category.slug !== 'all'
            ? { category_slug: category.slug }
            : { category_id: category.id })
        : undefined;

    Api.products(opts)
      .then((list) => {
        const normalized = Array.isArray(list) ? list : [];
        // Ensure placeholders for missing images
        const withImages = normalized.map((p) => ({
          ...p,
          image:
            p?.image && String(p.image).trim().length > 0
              ? p.image
              : 'https://via.placeholder.com/400x300.png?text=Product',
        }));

        // Save to both displays and cache allProducts when "All" is selected
        if (!opts) {
          setAllProducts(withImages);
          setProducts(withImages);
        } else {
          // If backend honored filter, use directly. If not, fallback filter from allProducts cache.
          if (withImages.length > 0) {
            setProducts(withImages);
          } else {
            const fallback =
              allProducts.length > 0
                ? allProducts.filter((p) =>
                    category.slug && category.slug !== 'all'
                      ? (p.category_slug ? p.category_slug === category.slug : false)
                      : String(p.category_id) === String(category.id)
                  )
                : [];
            setProducts(fallback);
          }
        }
      })
      .catch((e) => {
        console.error(e);
        setErrorProducts(e.message || 'Failed to load products');
      })
      .finally(() => setLoadingProducts(false));
  }, [category]);      

  useEffect(() => {
    if (isAuthed) {
      Api.cart(token).then(setCart).catch(console.error);
    } else {
      setCart({ items: [], subtotal: 0 });
    }
  }, [isAuthed, token]);

  function onLogin(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setRoute('products');
  }

  function onLogout() {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setRoute('products');
  }

  async function addToCart(productId, onSuccess) {
    try {
      if (!isAuthed) {
        setRoute('auth');
        return;
      }
      const updated = await Api.addToCart(token, productId, 1);
      setCart(updated);
      if (onSuccess) onSuccess();
    } catch (e) {
      alert(e.message);
    }
  }

  async function updateQty(productId, qty) {
    try {
      const updated = await Api.updateCart(token, productId, qty);
      setCart(updated);
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeItem(productId) {
    try {
      const updated = await Api.removeFromCart(token, productId);
      setCart(updated);
    } catch (e) {
      alert(e.message);
    }
  }

  async function placeOrder() {
    try {
      const order = await Api.createOrder(token);
      alert(`Order placed! ID: ${order.id}`);
      setCart({ items: [], subtotal: 0 });
      setRoute('orders');
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ background: theme.background, minHeight: '100vh' }}>
      <Header
        onNav={setRoute}
        cartCount={cartCount}
        isAuthed={isAuthed}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: 16 }}>
        {route === 'products' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <CategorySelector
              categories={categories}
              selected={category}
              onChange={setCategory}
            />
            <ProductsPage
              products={products}
              onAdd={addToCart}
              loading={loadingProducts}
              error={errorProducts}
            />
          </div>
        )}
        {route === 'cart' && (
          <CartPage
            cart={cart}
            onQty={updateQty}
            onRemove={removeItem}
            onOrder={placeOrder}
          />
        )}
        {route === 'orders' && <OrdersPage isAuthed={isAuthed} />}
        {route === 'auth' && <AuthPage onLogin={onLogin} />}
      </main>

      <footer style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
        Simple Shopping • Ocean Professional Theme
      </footer>
    </div>
  );
}

function CategorySelector({ categories, selected, onChange }) {
  const handleChange = (e) => {
    const value = e.target.value;
    const found =
      (categories || []).find((c) => String(c.id) === value) ||
      (categories || [])[0] ||
      { id: 'all', slug: 'all', name: 'All' };
    onChange(found);
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="category" style={{ fontWeight: 600, color: theme.text }}>
          Category
        </label>
        <select
          id="category"
          value={String(selected?.id || 'all')}
          onChange={handleChange}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#111827',
            outline: 'none',
          }}
          aria-label="Select product category"
        >
          {(categories || []).map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}

function ProductsPage({ products, onAdd, loading, error }) {
  if (loading) {
    return (
      <Card>
        <div style={{ color: '#6b7280' }}>Loading products...</div>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <div style={{ color: theme.error, fontWeight: 600 }}>Error: {error}</div>
      </Card>
    );
  }
  if (!products || products.length === 0) {
    return (
      <Card>
        <div style={{ color: '#6b7280' }}>No products found for this category.</div>
      </Card>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
        gap: 16,
      }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const placeholder =
    'https://via.placeholder.com/400x300.png?text=Product';

  const imgSrc =
    product?.image && String(product.image).trim().length > 0
      ? product.image
      : placeholder;

  const handleAdd = async () => {
    await onAdd(product.id, () => {
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    });
  };

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            width: '100%',
            height: 150,
            borderRadius: 10,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.primary}15, #ffffff)`,
            border: `1px solid #e5e7eb`,
          }}
        >
          <img
            src={imgSrc}
            alt={product?.name || 'Product image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.currentTarget.src = placeholder;
            }}
          />
        </div>
        <div style={{ fontWeight: 700, color: theme.text }}>{product.name}</div>
        <div style={{ color: '#6b7280', minHeight: 40 }}>
          {product.description || 'No description available.'}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ color: theme.primary, fontWeight: 800 }}>
            ${Number(product.price || 0).toFixed(2)}
          </div>
          <button
            style={{
              ...buttonStyle('accent'),
              background: added ? theme.primary : theme.secondary,
              color: added ? '#fff' : '#111827',
              boxShadow: added ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 200ms ease',
            }}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Card>
  );
}

function CartPage({ cart, onQty, onRemove, onOrder }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Your Cart</h2>
        {cart.items.length === 0 ? (
          <div style={{ color: '#6b7280' }}>Your cart is empty.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.items.map(({ product, quantity, line_total }) => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <img
                  src={
                    product?.image && String(product.image).trim().length > 0
                      ? product.image
                      : 'https://via.placeholder.com/200x150.png?text=Product'
                  }
                  alt={product.name}
                  style={{
                    width: 80,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/200x150.png?text=Product';
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ color: '#6b7280' }}>
                    ${product.price.toFixed(2)} each
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    style={buttonStyle('outline')}
                    onClick={() => onQty(product.id, quantity - 1)}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    style={buttonStyle('outline')}
                    onClick={() => onQty(product.id, quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    style={buttonStyle('ghost')}
                    onClick={() => onRemove(product.id)}
                  >
                    Remove
                  </button>
                  <div
                    style={{ width: 80, textAlign: 'right', fontWeight: 600 }}
                  >
                    ${line_total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <strong>${cart.subtotal.toFixed(2)}</strong>
        </div>
        <div style={{ height: 8 }} />
        <button
          disabled={cart.items.length === 0}
          style={buttonStyle('primary')}
          onClick={onOrder}
        >
          Place Order
        </button>
      </Card>
    </div>
  );
}

function OrdersPage({ isAuthed }) {
  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>Orders</h2>
      {!isAuthed ? (
        <div>You must login to view orders.</div>
      ) : (
        <div>Order history feature coming soon in this demo.</div>
      )}
    </Card>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = mode === 'login' ? Api.login : Api.signup;
      const data = await fn(email, pwd);
      onLogin(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>
        {mode === 'login' ? 'Login' : 'Create Account'}
      </h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            style={inputStyle}
          />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={buttonStyle('primary')}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={buttonStyle('outline')}
          >
            {mode === 'login' ? 'Create an account' : 'Have an account? Login'}
          </button>
        </div>
      </form>
    </Card>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  outline: 'none',
};

export default App;
