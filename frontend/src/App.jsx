import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/useAuth";
import { getStoredToken } from "./api/axios";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const DashboardLayout = lazy(() =>
  import("./components/layout/DashboardLayout")
);
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Transactions = lazy(() => import("./pages/Transactions"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-4 animate-pulse">
        <div className="h-16 rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
        <div className="h-72 rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
      </div>
    </div>
  );
}

// Guards a route: only accessible when logged in
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const hasToken = Boolean(getStoredToken());
  if (!user && !hasToken) return <Navigate to="/login" replace />;
  return children;
}

// Keeps logged-in users out of the auth pages
function PublicRoute({ children }) {
  const { user } = useAuth();
  const hasToken = Boolean(getStoredToken());
  if (user || hasToken) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* App opens directly to login or dashboard - no marketing landing page */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Overview" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
