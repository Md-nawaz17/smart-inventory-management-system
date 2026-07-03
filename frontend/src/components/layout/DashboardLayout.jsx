import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { INVENTORY_UPDATED_EVENT } from "../../utils/inventoryEvents";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { pathname } = useLocation();
  const pageTitle =
    {
      "/dashboard": "Overview",
      "/dashboard/products": "Products",
      "/dashboard/analytics": "Analytics",
      "/dashboard/transactions": "Transactions",
    }[pathname] || title;

  const fetchLowStockCount = useCallback(async () => {
    try {
      const { data } = await api.get("/products", {
        params: { page: 1, limit: 1 },
      });
      setLowStockCount(data.summary?.lowStockItems || 0);
    } catch {
      // Page-level requests surface API errors; the badge can fail quietly.
    }
  }, []);

  useEffect(() => {
    fetchLowStockCount();
    window.addEventListener(INVENTORY_UPDATED_EVENT, fetchLowStockCount);
    return () =>
      window.removeEventListener(INVENTORY_UPDATED_EVENT, fetchLowStockCount);
  }, [fetchLowStockCount]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={pageTitle}
          lowStockCount={lowStockCount}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
