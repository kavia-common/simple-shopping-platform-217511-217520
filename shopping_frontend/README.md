# Shopping Frontend

A minimal React app for the simple shopping platform.

## Scripts
- npm install
- npm start (runs on PORT=3000, HOST=0.0.0.0, BROWSER=none)
- npm run build
- npm test

## Backend API
The app expects a backend at http://localhost:3001.
You can override via environment at runtime:
REACT_APP_API_BASE_URL

Example:
REACT_APP_API_BASE_URL=http://localhost:3001 npm start
