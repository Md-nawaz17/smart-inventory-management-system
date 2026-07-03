import { useState } from "react";
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";

export default function Topbar({ onMenuClick, title = "Overview", lowStockCount = 0 }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-4 sm:px-6
                       border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80
                       backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
        <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500
                     dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <button
          aria-label="Notifications"
          className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500
                     dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg pl-1.5 pr-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user?.name || "User"}
            </span>
            <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800
                              bg-white dark:bg-slate-900 shadow-card dark:shadow-card-dark py-1.5 z-20 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400
                             hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
