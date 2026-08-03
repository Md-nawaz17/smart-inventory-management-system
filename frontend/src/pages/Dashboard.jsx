import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import SummaryCards from "../components/dashboard/SummaryCards";
import LowStockAlerts from "../components/dashboard/LowStockAlerts";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import TransactionLog from "../components/dashboard/TransactionLog";
import { useToast } from "../context/ToastContext";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    categoryData: [],
    movementData: [],
  });
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    totalCategories: 0,
    lowStockItems: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const [{ data: productData }, { data: analyticsData }] =
          await Promise.all([
            api.get("/products", {
              params: { page: 1, limit: 6, status: "low-stock" },
            }),
            api.get("/products/analytics"),
          ]);
        const lowStockItems = productData.products || [];
        setProducts(lowStockItems);
        setSummary({
          totalProducts: productData.summary?.totalProducts || 0,
          totalStockValue: productData.summary?.totalInventoryValue || 0,
          lowStockCount: productData.summary?.lowStockItems || 0,
          totalCategories: productData.summary?.totalCategories || 0,
          lowStockItems,
        });
        setAnalytics(analyticsData);
        const lowCount = productData.summary?.lowStockItems || 0;
        if (lowCount > 0) {
          toastRef.current.warning(`${lowCount} items are running low on stock`);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Dashboard data could not be loaded. Please try again.";
        toastRef.current.error(msg);
        setError(
          err?.response?.data?.message ||
            "Dashboard data could not be loaded. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} />

      <AnalyticsCharts
        stockByCategory={analytics.categoryData}
        stockMovement={analytics.movementData}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <LowStockAlerts items={products} />
        </div>
        <div className="xl:col-span-2">
          <TransactionLog compact />
        </div>
      </div>
    </div>
  );
}
