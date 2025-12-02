import React from 'react';

// Theme tokens
export const theme = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

// PUBLIC_INTERFACE
export function Header({ onNav, cartCount = 0, isAuthed, onLogout }) {
  /** Header with nav actions */
  return (
    <header style={{
      background: theme.surface,
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: 1024, margin: '0 auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        <div onClick={() => onNav('products')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${theme.primary}1A, #ffffff)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 8, border: `1px solid ${theme.primary}33`
          }}>
            <span style={{ color: theme.primary, fontWeight: 700 }}>SP</span>
          </div>
          <span style={{ fontWeight: 700, color: theme.text }}>Shop</span>
        </div>
        <nav style={{ display: 'flex', gap: 12 }}>
          <NavButton onClick={() => onNav('products')}>Products</NavButton>
          <NavButton onClick={() => onNav('cart')}>Cart ({cartCount})</NavButton>
          <NavButton onClick={() => onNav('orders')}>Orders</NavButton>
          {isAuthed ? (
            <button onClick={onLogout} style={buttonStyle('outline')}>
              Logout
            </button>
          ) : (
            <NavButton onClick={() => onNav('auth')}>Login/Signup</NavButton>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={buttonStyle('ghost')}>
      {children}
    </button>
  );
}

export function buttonStyle(variant = 'primary') {
  const base = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid transparent',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };
  if (variant === 'primary') {
    return { ...base, background: theme.primary, color: 'white' };
  }
  if (variant === 'outline') {
    return { ...base, background: 'transparent', color: theme.text, borderColor: '#e5e7eb' };
  }
  if (variant === 'ghost') {
    return { ...base, background: 'transparent', color: theme.text };
  }
  if (variant === 'accent') {
    return { ...base, background: theme.secondary, color: '#111827' };
  }
  return base;
}

// PUBLIC_INTERFACE
export function Card({ children }) {
  return (
    <div style={{
      background: theme.surface,
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      {children}
    </div>
  );
}
