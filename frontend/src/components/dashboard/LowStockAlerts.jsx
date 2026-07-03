import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Props: items = [{ _id, productName, supplier, quantity }]
 */
export default function LowStockAlerts({ items = [] }) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Low Stock Alerts</h3>
            <p className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""} need attention</p>
          </div>
        </div>
        {items.length > 0 && (
          <Link
            to="/dashboard/products"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-8 gap-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">All stock levels look healthy</p>
          <p className="text-xs text-slate-400">No products are running low right now.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 6).map((item) => {
            const threshold = 10;
            const pct = Math.min(100, Math.max(6, (item.quantity / threshold) * 100));
            const isOut = item.quantity <= 0;
            return (
              <li
                key={item._id}
                className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.productName}</p>
                  <div className="mt-1.5 h-1.5 w-full max-w-[160px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isOut ? "bg-rose-500" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`badge shrink-0 ${
                    isOut
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  {item.quantity} left
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
