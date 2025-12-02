# Shopping Frontend

A minimal React app for the simple shopping platform.

## Scripts
- npm install
- npm start (runs on PORT=3000, HOST=0.0.0.0, BROWSER=none)
- npm run build
- npm test

## Development server host checks
In certain preview environments, you may see an "Invalid Host header" error when accessing the app via a non-localhost hostname.  
This project includes a `.env` file that sets:
- `DANGEROUSLY_DISABLE_HOST_CHECK=true` (disables host checking in development for CRA dev server)
- `HOST=0.0.0.0` and `PORT=3000`
- `BROWSER=none`

These settings allow the dev server to accept requests from the preview host while binding to `0.0.0.0`.  
If you need to customize, update `shopping_frontend/.env`.

## Backend API
- Default backend base URL: same-origin (e.g., calling `/api/products`).
- In development, the CRA dev server proxies `/api/*` to `http://localhost:3001` (see package.json "proxy").
- You can override the base URL via environment at runtime with `REACT_APP_API_BASE_URL`.

Examples:
- Using default: `npm start` (will use http://localhost:3001)
- Custom base URL:
  - Unix/macOS: `REACT_APP_API_BASE_URL=http://localhost:4000 npm start`
  - Windows (PowerShell): `$env:REACT_APP_API_BASE_URL="http://localhost:4000"; npm start`

Note on CORS:
- If the backend is on a different origin than the frontend, ensure the backend sends appropriate CORS headers (e.g., `Access-Control-Allow-Origin: *` or your frontend origin).
- No extra frontend libraries are used; this app performs a simple GET request to `/api/products`.
