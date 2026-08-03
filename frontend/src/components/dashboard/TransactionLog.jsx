import { useCallback, useEffect, useState } from "react";
import {
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Loader2,
  Plus,
} from "lucide-react";
import api from "../../api/axios";
import { notifyInventoryUpdated } from "../../utils/inventoryEvents";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  productId: "",
  type: "stock-in",
  quantity: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const typeConfig = {
  "stock-in": {
    label: "Stock In",
    icon: ArrowDownCircle,
    tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  },
  "stock-out": {
    label: "Stock Out",
    icon: ArrowUpCircle,
    tone: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10",
  },
  adjustment: {
    label: "Adjustment",
    icon: RefreshCw,
    tone: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10",
  },
};

export default function TransactionLog({ compact = false }) {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions || data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch transactions.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/products", {
        params: { page: 1, limit: 500 },
      });
      setProducts(data.products || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch products.";
      toast.error(msg);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
    if (!compact) fetchProducts();
  }, [compact, fetchProducts, fetchTransactions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/transactions", form);
      setForm(emptyForm);
      await Promise.all([fetchTransactions(), fetchProducts()]);
      notifyInventoryUpdated();
      const okMsg = form.type === "stock-in" ? "Stock-in recorded successfully" : "Stock-out recorded successfully";
      toast.success(okMsg);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not record transaction.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <History className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
            {compact ? "Recent Transactions" : "Stock Transactions"}
          </h3>
          <p className="text-xs text-slate-400">
            {compact ? "Latest stock movements" : "Record and review stock movements"}
          </p>
        </div>
      </div>

      {!compact && (
        <form onSubmit={handleSubmit} className="mb-5 grid grid-cols-1 md:grid-cols-6 gap-3">
          {error && (
            <p className="md:col-span-6 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          )}

          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            className="input-field md:col-span-2"
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName} ({product.quantity} in stock)
              </option>
            ))}
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="stock-in">Stock in</option>
            <option value="stock-out">Stock out</option>
          </select>

          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="input-field"
            required
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="input-field"
          />

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Record
          </button>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Optional note"
            className="input-field md:col-span-6"
          />
        </form>
      )}

      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/60 animate-pulse" />
          ))
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No transactions recorded yet.</p>
        ) : (
          transactions.slice(0, compact ? 8 : 50).map((transaction) => {
            const cfg = typeConfig[transaction.type] || typeConfig.adjustment;
            const Icon = cfg.icon;
            return (
              <div
                key={transaction._id}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${cfg.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {transaction.productName || transaction.product?.productName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {cfg.label} - {transaction.quantity} units -{" "}
                    {new Date(transaction.date || transaction.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 shrink-0 truncate max-w-[140px]">
                  {transaction.note || "-"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
