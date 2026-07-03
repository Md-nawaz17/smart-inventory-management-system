# Smart Inventory Frontend

React + Vite frontend for the Smart Inventory Management System.

## Local Development

```bash
npm install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Use this local API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173/`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production app into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## App Routes

| Route | Description |
| --- | --- |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Protected overview dashboard |
| `/dashboard/products` | Product table, filters, CRUD, and XLSX export |
| `/dashboard/analytics` | Category and stock movement charts |
| `/dashboard/transactions` | Stock-in and stock-out transaction form and history |

The frontend defaults to `http://localhost:5000/api` if `VITE_API_URL` is not
set.
