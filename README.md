# Smart Inventory Management System

A full-stack MERN inventory dashboard for authenticated users to manage stock,
track product movement, view analytics, and export inventory data to Excel.

## Current Running App

The project runs as two separate services during local development:

| Service | Location | Command | Local URL |
| --- | --- | --- | --- |
| Backend API | `backend/` | `npm run dev` | `http://localhost:5000` |
| Frontend app | `frontend/` | `npm run dev` | `http://localhost:5173` |

The frontend calls the backend through `VITE_API_URL`, which should point to the
API base path:

```env
VITE_API_URL=http://localhost:5000/api
```

## Features

- JWT login, registration, protected routes, and persistent auth storage
- User-specific products and transactions
- Add, edit, delete, search, filter, and paginate inventory products
- Low-stock and out-of-stock states with a shared 10-unit low-stock threshold
- Overview dashboard with inventory value, category count, low-stock count, and recent movement
- Stock-in and stock-out transaction recording with quantity validation
- Latest 50 transaction history entries
- Category and 30-day stock movement analytics with Recharts
- XLSX inventory export from the products table
- Light and dark theme support
- Responsive React dashboard layout for desktop and mobile

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS |
| Routing | React Router |
| Charts | Recharts |
| Icons | Lucide React |
| Export | XLSX |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Deployment | Render backend, Vercel frontend |

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB connection string

This repository was verified locally with Node `v24.16.0` and npm `11.13.0`.

## Local Setup

Clone the project and install dependencies separately for the backend and
frontend.

### Backend

```bash
cd backend
npm install
```

Create the backend environment file:

```powershell
Copy-Item .env.example .env
```

Fill in `backend/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Then start the API:

```bash
npm run dev
```

The API should respond at:

```text
http://localhost:5000/
```

Expected response:

```text
Inventory Management System API Running
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Fill in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

The app redirects between `/login`, `/register`, and the protected
`/dashboard` area depending on auth state.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm start` | Run the Express API with Node |
| `npm run dev` | Run the Express API with Nodemon |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | No | JWT lifetime. Defaults to `7d`. |
| `CLIENT_URL` | No | Allowed frontend origin for CORS. Supports comma-separated origins. |
| `DNS_SERVERS` | No | Optional comma-separated DNS servers for MongoDB DNS resolution. |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend API base URL. Defaults to `http://localhost:5000/api`. |

## API Endpoints

The backend mounts routes under `/api`. Product and transaction routes require:

```http
Authorization: Bearer <jwt-token>
```

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user and return a JWT |
| `POST` | `/api/auth/login` | Login and return a JWT |
| `GET` | `/api/auth/me` | Return the current authenticated user |
| `GET` | `/api/products?page=1&limit=10&search=&category=All&status=All` | Return products with summary, categories, and pagination metadata |
| `POST` | `/api/products/add` | Create a product |
| `GET` | `/api/products/export` | Return all products for XLSX export |
| `GET` | `/api/products/analytics` | Return category totals and 30-day stock movement |
| `GET` | `/api/products/:id` | Return one product owned by the user |
| `PUT` | `/api/products/:id` | Update one product owned by the user |
| `DELETE` | `/api/products/:id` | Delete one product and its related transactions |
| `POST` | `/api/transactions` | Record stock-in or stock-out and update product quantity |
| `GET` | `/api/transactions` | Return the latest 50 transactions |

## Deployment

### Render Backend

The repository includes `render.yaml` for Render Blueprint deployment.

1. Create a Render Blueprint from this repository, or create a Web Service with
   `backend` as the root directory.
2. Use `npm install` as the build command.
3. Use `npm start` as the start command.
4. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`

### Vercel Frontend

The frontend includes `frontend/vercel.json` with the Vite build command,
`dist` output directory, and SPA rewrites.

1. Import the repository in Vercel.
2. Set the project root to `frontend`.
3. Add `VITE_API_URL=https://your-render-service.onrender.com/api`.
4. Deploy.

## Screenshots

Screenshots live in the `screenshots/` folder.

![Login](screenshots/Frontpage.png)
![Dashboard](screenshots/dashboard.png)
![Analytics](screenshots/analytics.png)
![Products](screenshots/products.png)
![Dark Mode](screenshots/darkmode1.png)

## Project Structure

```text
smart-inventory-system
|-- backend
|   |-- middleware
|   |-- models
|   |-- routes
|   |-- server.js
|   `-- package.json
|-- frontend
|   |-- public
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- context
|   |   |-- pages
|   |   |-- utils
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- vercel.json
|   `-- package.json
|-- screenshots
|-- render.yaml
`-- README.md
```

## Verification

Latest local verification performed:

- `npm run lint` in `frontend/`
- `npm run build` in `frontend/`
- `node --check` for every backend `.js` file
- HTTP smoke check for `http://localhost:5000/`
- HTTP smoke check for `http://localhost:5173/`
- Unauthorized API smoke checks for protected product/auth routes

## Author

Mohammed Nawaz

## License

This project is created for educational and portfolio purposes.
