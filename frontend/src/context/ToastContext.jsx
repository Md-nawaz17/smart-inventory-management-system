import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ToastList from "../components/ui/Toast";

const ToastContext = createContext(null);

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback(({ type = "info", title = "", message = "" }) => {
    setToasts((current) => {
      const next = [...current];
      if (next.length >= 3) next.shift();
      next.push({ id: idCounter++, type, title, message });
      return next;
    });
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) => {
      const id = setTimeout(() => remove(t.id), 3000);
      return () => clearTimeout(id);
    });
    return () => timers.forEach((fn) => fn());
  }, [toasts, remove]);

  const toast = useCallback(
    (type, message, title = "") => add({ type, title, message }),
    [add]
  );

  const api = useMemo(
    () => ({
      toast,
      success: (msg, title) => toast("success", msg, title),
      error: (msg, title) => toast("error", msg, title),
      warning: (msg, title) => toast("warning", msg, title),
      info: (msg, title) => toast("info", msg, title),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastList toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default ToastContext;
