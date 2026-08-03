import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  danger = false,
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement;

    // Focus the dialog container for accessibility
    setTimeout(() => {
      if (dialogRef.current) dialogRef.current.focus();
    }, 0);

    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel?.();
        return;
      }

      // Basic focus trap: keep focus inside dialog
      if (e.key === "Tab") {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      try {
        previouslyFocused.current?.focus?.();
      } catch {
        // The original trigger may have been removed before the dialog closed.
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (!dialogRef.current?.contains(e.target)) onCancel?.();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-200 opacity-100" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg transform transition-all duration-200 ease-out p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              danger
                ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500/90"
                : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
