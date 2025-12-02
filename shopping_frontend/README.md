# Shopping Frontend

A minimal React app for the simple shopping platform.

## Scripts
- npm install
- npm start (runs on PORT=3000, HOST=0.0.0.0, BROWSER=none)
- npm run build
- npm test

## Backend API
- Default backend base URL: `http://localhost:3001`
- The frontend fetches products from: `<BASE_URL>/api/products`
- You can override the base URL via environment at runtime with `REACT_APP_API_BASE_URL`.

Examples:
- Using default: `npm start` (will use http://localhost:3001)
- Custom base URL:
  - Unix/macOS: `REACT_APP_API_BASE_URL=http://localhost:4000 npm start`
  - Windows (PowerShell): `$env:REACT_APP_API_BASE_URL="http://localhost:4000"; npm start`

Note on CORS:
- If the backend is on a different origin than the frontend, ensure the backend sends appropriate CORS headers (e.g., `Access-Control-Allow-Origin: *` or your frontend origin).
- No extra frontend libraries are used; this app performs a simple GET request to `/api/products`.
