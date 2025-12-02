# Shopping Frontend

A minimal React app for the simple shopping platform.

## Scripts
- npm install
- npm start (runs on PORT=3000, HOST=0.0.0.0, BROWSER=none)
- npm run build
- npm test

## Fixing "Invalid Host header" in development
In preview/proxied environments, CRA can show "Invalid Host header" when accessed via a non-localhost hostname.  
This project includes dev-only environment settings to make the dev server work reliably:

Files:
- `.env`
- `.env.development.local` (fallback/override for local dev)

Both set:
- `HOST=0.0.0.0` and `PORT=3000` (binds to all interfaces, stable port)
- `DANGEROUSLY_DISABLE_HOST_CHECK=true` (disables host check in development)
- `HTTPS=false` (use HTTP)
- `WDS_SOCKET_PORT=3000` (stabilizes dev server websocket in proxied environments)
- `BROWSER=none` (optional, prevents auto-browser open)

Additionally, the start script ensures `HOST` is honored:
- package.json: `"start": "HOST=${HOST:-0.0.0.0} react-scripts start"`

Security note:
- Disabling host checks is unsafe for production. These settings are for development only and only affect `npm start`.  
- Production builds created with `npm run build` are not impacted.

## Backend API
- Default backend base URL: same-origin (e.g., calling `/api/products`).
- In development, the CRA dev server proxies `/api/*` to `http://localhost:3001` (see package.json "proxy").
- You can override the base URL via environment at runtime with `REACT_APP_API_BASE_URL`.

Examples:
- Using default: `npm start` (will proxy to http://localhost:3001)
- Custom base URL:
  - Unix/macOS: `REACT_APP_API_BASE_URL=http://localhost:4000 npm start`
  - Windows (PowerShell): `$env:REACT_APP_API_BASE_URL="http://localhost:4000"; npm start`

Note on CORS:
- If the backend is on a different origin than the frontend, ensure the backend sends appropriate CORS headers (e.g., `Access-Control-Allow-Origin: *` or your frontend origin).
- No extra frontend libraries are used; this app performs a simple GET request to `/api/products`.
