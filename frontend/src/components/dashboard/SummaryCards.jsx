import { Package, DollarSign, AlertTriangle, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Props:
 * summary = {
 *   totalProducts: number,
 *   totalStockValue: number,
 *   lowStockCount: number,
 *   totalCategories: number,
 *   trends?: { products: number, value: number } // optional % change
 * }
 */
export default function SummaryCards({ summary = {} }) {
  const {
    totalProducts = 0,
    totalStockValue = 0,
    lowStockCount = 0,
    totalCategories = 0,
    trends = {},
  } = summary;

  const cards = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      accent: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
      trend: trends.products,
    },
    {
      label: "Inventory Value",
      value: `Rs. ${Number(totalStockValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      trend: trends.value,
    },
    {
      label: "Low Stock Alerts",
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      highlight: lowStockCount > 0,
    },
    {
      label: "Categories",
      value: totalCategories.toLocaleString(),
      icon: Layers,
      accent: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, accent, trend, highlight }) => (
        <div
          key={label}
          className={`surface p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
            highlight ? "ring-1 ring-amber-200 dark:ring-amber-500/30" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent}`}>
              <Icon className="h-5.5 w-5.5" />
            </div>
            {typeof trend === "number" && (
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="mt-4 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
