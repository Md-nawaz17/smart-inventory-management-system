# StockPilot

StockPilot is a full-stack inventory management dashboard. Authenticated users
can manage products, record stock movement, track low-stock items, review
analytics, and export inventory to Excel.

## Live Demo

A public deployment is not configured yet. The repository includes Render and
Vercel configuration so the frontend and API can be deployed without changing
application code.

## Features

- JWT authentication with protected dashboard routes
- Product create, edit, delete, search, filters, and pagination
- Configurable per-product reorder points and low-stock alerts
- Stock-in and stock-out transactions with quantity validation
- Dashboard summaries, category analytics, and 30-day movement charts
- XLSX inventory exports
- Responsive light and dark interface
- Toast feedback, delete confirmation, and stock-alert notifications
- Security headers, authentication rate limiting, and GitHub Actions CI

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| UI and data | Lucide React, Recharts, SheetJS/xlsx |
| Deployment | Vercel frontend, Render backend |

## Run Locally

Requirements: Node.js 20 or later, npm, and a MongoDB connection string.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Deploy

1. Create a Render Web Service from `render.yaml` and set `MONGO_URI`,
   `JWT_SECRET`, and `CLIENT_URL`.
2. Import the repository into Vercel with `frontend` as the project root.
3. Set `VITE_API_URL` in Vercel to the Render API URL followed by `/api`.
4. Update Render's `CLIENT_URL` with the Vercel deployment URL, then redeploy
   the backend.

The project includes `frontend/vercel.json` for Vercel SPA routing and
`render.yaml` for the Render API service.

## Verification

- Frontend lint and production build pass.
- Backend JavaScript syntax checks pass.
- The API root and frontend root return HTTP 200 locally.
- Protected product routes return HTTP 401 without a token.

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Products](screenshots/products.png)
![Analytics](screenshots/analytics.png)

## License

Created for educational and portfolio use.
