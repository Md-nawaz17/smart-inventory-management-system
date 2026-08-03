import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  ArrowUpDown,
} from "lucide-react";
import api from "../../api/axios";
import ConfirmDialog from "../ui/ConfirmDialog";
import { notifyInventoryUpdated } from "../../utils/inventoryEvents";
import ProductModal from "./ProductModal";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 10;
const DEFAULT_REORDER_POINT = 10;

function getReorderPoint(product) {
  if (
    product?.reorderPoint === undefined ||
    product?.reorderPoint === null ||
    product?.reorderPoint === ""
  ) {
    return DEFAULT_REORDER_POINT;
  }

  const reorderPoint = Number(product?.reorderPoint);
  return Number.isFinite(reorderPoint) && reorderPoint >= 0
    ? reorderPoint
    : DEFAULT_REORDER_POINT;
}

function stockStatus(qty, threshold = DEFAULT_REORDER_POINT) {
  if (qty <= 0) return { label: "Out of stock", tone: "rose" };
  if (qty < threshold) return { label: "Low stock", tone: "amber" };
  return { label: "In stock", tone: "emerald" };
}

const toneClasses = {
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
};

const rowAccent = {
  rose: "border-l-4 border-l-rose-500",
  amber: "border-l-4 border-l-amber-500",
  emerald: "border-l-4 border-l-transparent",
};

export default function ProductTable({ onDataChange }) {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProduct, setConfirmProduct] = useState(null);

  // ---- Fetch products from your existing backend ----
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { page: 1, limit: 500 },
      });
      const nextProducts = data.products || [];
      setProducts(nextProducts);
      onDataChange?.(nextProducts);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch products.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const status = stockStatus(p.quantity, getReorderPoint(p)).label;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "low" && status === "Low stock") ||
        (statusFilter === "out" && status === "Out of stock") ||
        (statusFilter === "in" && status === "In stock");
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, categoryFilter, statusFilter]);

  // CRUD handlers for the existing product endpoints.
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        productName: formData.productName,
        category: formData.category,
        quantity: Number(formData.quantity),
        reorderPoint: Number(formData.reorderPoint),
        price: Number(formData.price),
        supplier: formData.supplier,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products/add", payload);
        toast.success("Product added successfully");
      }
      await fetchProducts();
      notifyInventoryUpdated();
      setModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save product.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmProduct) return;
    const id = confirmProduct._id;
    setConfirmOpen(false);
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      await fetchProducts();
      notifyInventoryUpdated();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete product.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setConfirmProduct(null);
    }
  };

  // Excel export uses the existing JSON endpoint.
  const handleExport = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const { data } = await api.get("/products/export");
      const rows = data.map((product) => ({
        "Product Name": product.productName,
        Category: product.category,
        Quantity: product.quantity,
        "Low Stock Alert At": getReorderPoint(product),
        Price: product.price,
        Supplier: product.supplier,
        "Inventory Value": Number(product.quantity) * Number(product.price),
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `inventory-report-${Date.now()}.xlsx`);
      toast.success("Inventory exported successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to export products.";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="surface">
      {/* Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or supplier..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-auto py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="all">All stock status</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary ml-auto lg:ml-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
              <th className="px-5 py-3.5 font-semibold">
                <span className="flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-5 py-3.5 font-semibold">Supplier</th>
              <th className="px-5 py-3.5 font-semibold">Category</th>
              <th className="px-5 py-3.5 font-semibold text-right">Quantity</th>
              <th className="px-5 py-3.5 font-semibold text-right">Price</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <PackageOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {products.length === 0 ? "No products yet" : "No matching products"}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {products.length === 0
                          ? "Add your first product to start tracking inventory."
                          : "Try adjusting your search or filters."}
                      </p>
                    </div>
                    {products.length === 0 && (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="btn-primary mt-1"
                      >
                        <Plus className="h-4 w-4" /> Add product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const reorderPoint = getReorderPoint(p);
                const status = stockStatus(p.quantity, reorderPoint);
                return (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td
                      className={`px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100 ${rowAccent[status.tone]}`}
                    >
                      {p.productName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{p.supplier}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="px-5 py-3.5 text-right text-slate-700 dark:text-slate-200 tabular-nums">{p.quantity}</td>
                    <td className="px-5 py-3.5 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                      Rs. {Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`badge border ${toneClasses[status.tone]}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Alert: {reorderPoint}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setModalOpen(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                          aria-label={`Edit ${p.productName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setConfirmProduct(p); setConfirmOpen(true); }}
                          disabled={deletingId === p._id}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                          aria-label={`Delete ${p.productName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            Showing <span className="font-medium text-slate-600 dark:text-slate-300">{(page - 1) * PAGE_SIZE + 1}
            -{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{" "}
            <span className="font-medium text-slate-600 dark:text-slate-300">{filtered.length}</span> products
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300 px-2 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`Delete ${confirmProduct?.productName || "product"}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmProduct(null);
        }}
      />

      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSave}
        initialData={editingProduct}
        saving={saving}
      />
    </div>
  );
}
