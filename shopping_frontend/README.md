# Shopping Frontend

A minimal React app for the simple shopping platform.

## Scripts
- npm install
- npm start (runs on PORT=3000, HOST=0.0.0.0, BROWSER=none)
- npm run build
- npm test

## Fixing "Invalid Host header" in development
In preview/proxied environments, CRA can show "Invalid Host header" when accessed via a non-localhost hostname.

This project applies a deterministic fix directly in the start script so no local `.env` is required:
- package.json start script sets, by default:
  - `HOST=0.0.0.0`
  - `DANGEROUSLY_DISABLE_HOST_CHECK=true`
  - `WDS_SOCKET_PORT=3000`
  - `BROWSER=none`
  - `PORT=3000`

You can still override these via environment if needed.

Security note:
- Disabling host checks is unsafe for production. These settings are for development only and only affect `npm start`.
- Production builds created with `npm run build` are not impacted.

Optional:
- See `.env.example` for variables you may set locally (copy to `.env` if desired).

## Backend API
- Default backend base URL: http://localhost:3001
- You can override the base URL via environment at runtime with `REACT_APP_API_BASE_URL`.

Examples:
- Using default: `npm start` (frontend at http://localhost:3000 calls backend at http://localhost:3001)
- Custom base URL:
  - Unix/macOS: `REACT_APP_API_BASE_URL=http://localhost:4000 npm start`
  - Windows (PowerShell): `$env:REACT_APP_API_BASE_URL="http://localhost:4000"; npm start`

Note on CORS:
- If the backend is on a different origin than the frontend, ensure the backend sends appropriate CORS headers (e.g., `Access-Control-Allow-Origin: *` or your frontend origin).
- No extra frontend libraries are used; this app performs a simple GET request to `/api/products`.
