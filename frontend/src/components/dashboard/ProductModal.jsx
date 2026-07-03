import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

const emptyProduct = {
  productName: "",
  category: "",
  quantity: "",
  price: "",
  supplier: "",
};

export default function ProductModal({ open, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...emptyProduct, ...initialData } : emptyProduct);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isEdit = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg surface p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product name</label>
              <input
                name="productName"
                required
                value={form.productName}
                onChange={handleChange}
                placeholder="e.g. Wireless Mouse"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Supplier</label>
              <input
                name="supplier"
                required
                value={form.supplier}
                onChange={handleChange}
                placeholder="e.g. Acme Supplies"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <input
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
              <input
                name="quantity"
                type="number"
                min="0"
                required
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price (Rs.)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
              />
            </div>

            <p className="sm:col-span-2 text-xs text-slate-400">
              Low-stock alerts use the backend threshold of 10 units.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
