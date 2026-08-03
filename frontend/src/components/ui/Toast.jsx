import { X } from "lucide-react";

export default function ToastList({ toasts, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="w-full animate-slide-in"
        >
          <div
            role="status"
            className={`rounded-lg border px-4 py-3 shadow-sm flex items-start gap-3 ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
                : t.type === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300"
                : t.type === "warning"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300"
            }`}
          >
            <div className="flex-1">
              {t.title && <div className="font-semibold text-sm mb-0.5">{t.title}</div>}
              <div className="text-sm leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => onClose(t.id)}
              className="ml-2 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
