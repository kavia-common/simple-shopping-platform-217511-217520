import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Api } from './api';
import { Header, Card, buttonStyle, theme } from './ui';

// PUBLIC_INTERFACE
function App() {
  /** Minimal SPA with internal "routes": products | cart | orders | auth */
  const [route, setRoute] = useState('products');
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const isAuthed = !!token;
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const cartCount = useMemo(() => cart.items.reduce((a, i) => a + i.quantity, 0), [cart]);

  useEffect(() => {
    Api.products().then(setProducts).catch(console.error);
  }, []);

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

  async function addToCart(productId) {
    try {
      if (!isAuthed) {
        setRoute('auth');
        return;
      }
      const updated = await Api.addToCart(token, productId, 1);
      setCart(updated);
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
          <ProductsPage products={products} onAdd={addToCart} />
        )}
        {route === 'cart' && (
          <CartPage cart={cart} onQty={updateQty} onRemove={removeItem} onOrder={placeOrder} />
        )}
        {route === 'orders' && (
          <OrdersPage isAuthed={isAuthed} />
        )}
        {route === 'auth' && (
          <AuthPage onLogin={onLogin} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
        Simple Shopping • Ocean Professional Theme
      </footer>
    </div>
  );
}

function ProductsPage({ products, onAdd }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
      {products.map(p => (
        <Card key={p.id}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ fontWeight: 700, color: theme.text }}>{p.name}</div>
            <div style={{ color: '#6b7280', minHeight: 40 }}>{p.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: theme.primary, fontWeight: 700 }}>${p.price.toFixed(2)}</div>
              <button style={buttonStyle('accent')} onClick={() => onAdd(p.id)}>Add</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
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
              <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center' }}>
                <img src={product.image} alt={product.name} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ color: '#6b7280' }}>${product.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button style={buttonStyle('outline')} onClick={() => onQty(product.id, quantity - 1)}>-</button>
                  <span>{quantity}</span>
                  <button style={buttonStyle('outline')} onClick={() => onQty(product.id, quantity + 1)}>+</button>
                  <button style={buttonStyle('ghost')} onClick={() => onRemove(product.id)}>Remove</button>
                  <div style={{ width: 80, textAlign: 'right', fontWeight: 600 }}>${line_total.toFixed(2)}</div>
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
        <button disabled={cart.items.length === 0} style={buttonStyle('primary')} onClick={onOrder}>Place Order</button>
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
      <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPwd(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            style={inputStyle}
          />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={buttonStyle('primary')}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign up')}
          </button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={buttonStyle('outline')}>
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
