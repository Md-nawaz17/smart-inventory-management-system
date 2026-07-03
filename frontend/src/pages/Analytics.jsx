import { useEffect, useState } from "react";
import api from "../api/axios";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    categoryData: [],
    movementData: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/products/analytics");
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(
          err?.response?.data?.message ||
            "Analytics could not be loaded. Please try again."
        );
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}
      <AnalyticsCharts
        stockByCategory={analytics.categoryData}
        stockMovement={analytics.movementData}
      />
    </div>
  );
}
