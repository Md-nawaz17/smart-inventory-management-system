import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { INVENTORY_UPDATED_EVENT } from "../../utils/inventoryEvents";

const DEFAULT_REORDER_POINT = 10;

function getReorderPoint(product) {
  const value = product?.reorderPoint;

  if (value === undefined || value === null || value === "") {
    return DEFAULT_REORDER_POINT;
  }

  const reorderPoint = Number(value);
  return Number.isFinite(reorderPoint) && reorderPoint >= 0
    ? reorderPoint
    : DEFAULT_REORDER_POINT;
}

function needsAttention(product) {
  const quantity = Number(product?.quantity);
  const currentStock = Number.isFinite(quantity) ? quantity : 0;

  return currentStock <= 0 || currentStock < getReorderPoint(product);
}

export default function NotificationPanel({ isOpen, onClose, boundaryRef }) {
  const panelRef = useRef(null);
  const toast = useToast();
  const toastRef = useRef(toast);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/products", {
        params: { page: 1, limit: 500 },
      });
      const lowStockProducts = (data.products || [])
        .filter(needsAttention)
        .sort((left, right) => {
          const stockDifference = Number(left.quantity) - Number(right.quantity);

          return stockDifference || left.productName.localeCompare(right.productName);
        });

      setItems(lowStockProducts);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load stock notifications.";

      setItems([]);
      setError(message);
      toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      const clickedInsidePanel = panelRef.current?.contains(event.target);
      const clickedBell = boundaryRef?.current?.contains(event.target);

      if (!clickedInsidePanel && !clickedBell) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    loadNotifications();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener(INVENTORY_UPDATED_EVENT, loadNotifications);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(INVENTORY_UPDATED_EVENT, loadNotifications);
    };
  }, [boundaryRef, isOpen, loadNotifications, onClose]);

  return (
    <section
      id="notification-panel"
      ref={panelRef}
      role="dialog"
      aria-label="Stock notifications"
      aria-hidden={!isOpen}
      className={`absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card transition-all duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 dark:shadow-card-dark ${
        isOpen
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-2 scale-95 opacity-0"
      } max-h-80`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Stock alerts
          </h2>
        </div>
        {!loading && items.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 px-4 py-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
              <LoaderCircle className="h-4 w-4 animate-spin text-slate-300 dark:text-slate-600" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="px-4 py-5 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-7 text-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            All items are well stocked {"\u2713"}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => {
            const quantity = Number(item.quantity);
            const currentStock = Number.isFinite(quantity) ? quantity : 0;
            const isOutOfStock = currentStock <= 0;
            const reorderPoint = getReorderPoint(item);

            return (
              <li key={item._id} className="px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {item.productName}
                </p>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">Alert at {reorderPoint}</span>
                  <span
                    className={
                      isOutOfStock
                        ? "font-semibold text-rose-600 dark:text-rose-400"
                        : "font-semibold text-amber-600 dark:text-amber-400"
                    }
                  >
                    {currentStock} in stock
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-slate-100 p-2 dark:border-slate-800">
        <Link
          to="/dashboard/products"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
        >
          View Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
