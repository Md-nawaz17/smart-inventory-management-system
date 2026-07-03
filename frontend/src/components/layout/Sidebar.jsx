import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  History,
  Boxes,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/transactions", label: "Transactions", icon: History },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 bg-white dark:bg-slate-900
                   border-r border-slate-200 dark:border-slate-800 flex flex-col
                   transition-transform duration-200 lg:static lg:translate-x-0
                   ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Boxes className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">
              StockPilot
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white">
          <p className="text-xs font-semibold text-brand-100">Need a full export?</p>
          <p className="text-xs text-brand-100/80 mt-1 leading-relaxed">
            Download your latest inventory as an Excel report anytime.
          </p>
        </div>
      </aside>
    </>
  );
}
