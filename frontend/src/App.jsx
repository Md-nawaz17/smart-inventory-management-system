// ============================================================
// App.jsx — Smart Inventory System
// UI/UX Improvements (business logic is 100% unchanged):
//   1. Auto-scroll + focus + glow animation on Edit
//   2. Edit mode visual state (heading, button color, badge)
//   3. Glassmorphism form card with gradient border
//   4. Enhanced KPI dashboard cards
//   5. Chart section styling hooks (logic unchanged)
//   6. Product table improvements
//   7. Professional empty state
//   8. Mobile responsiveness
//   9. Micro-animations throughout
// ============================================================

import { useEffect, useRef, useState } from "react";       // [NEW] added useRef
import * as XLSX from "xlsx";
import "./App.css";
import DashboardCharts from "./components/DashboardCharts";

function App() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  // [NEW] Refs for auto-scroll & focus on edit
  const formSectionRef = useRef(null);
  const productNameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    price: "",
    supplier: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── UNCHANGED: all API / business logic ──────────────────

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.quantity),
    0
  );
  const totalValue = products.reduce(
    (sum, product) => sum + Number(product.quantity) * Number(product.price),
    0
  );
  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) < 10
  ).length;

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.quantity) < 0 || Number(formData.price) < 0) {
      alert("Quantity and Price cannot be negative");
      return;
    }
    try {
      let url = "http://localhost:5000/api/products/add";
      let method = "POST";
      if (editId) {
        url = `http://localhost:5000/api/products/${editId}`;
        method = "PUT";
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(data.message);
      setFormData({
        productName: "",
        category: "",
        quantity: "",
        price: "",
        supplier: "",
      });
      setEditId(null);
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  // [IMPROVED] editProduct — adds auto-scroll, focus, and glow animation
  const editProduct = (product) => {
    setEditId(product._id);
    setFormData({
      productName: product.productName,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier,
    });

    // [NEW] Smooth scroll to form section
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // [NEW] Focus the first input after scroll settles
    setTimeout(() => {
      if (productNameInputRef.current) {
        productNameInputRef.current.focus();
      }
      // [NEW] Trigger glow animation by toggling a CSS class
      if (formSectionRef.current) {
        formSectionRef.current.classList.remove("form-edit-glow");
        // Force reflow so animation restarts every time Edit is clicked
        void formSectionRef.current.offsetWidth;
        formSectionRef.current.classList.add("form-edit-glow");
      }
    }, 450);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map((product) => ({
        Product: product.productName,
        Category: product.category,
        Quantity: product.quantity,
        Price: product.price,
        Supplier: product.supplier,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "inventory-products.xlsx");
  };

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>

      {/* ── NAVBAR (unchanged structure, CSS improved) ── */}
      <nav className="navbar">
        <div className="logo">📦 Smart Inventory</div>
        <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </nav>

      <div className="container">

        {/* ── HERO ── */}
        <div className="hero-section">
          <h1>Inventory Management System</h1>
          <p className="hero-subtitle">
            Track inventory, monitor stock levels and manage products efficiently.
          </p>
        </div>

        {/* ── DASHBOARD STAT CARDS (data unchanged, styling enhanced) ── */}
        <div className="dashboard-cards">
          <div className="card card-products">
            <div className="card-header">
              <h3>Total Products</h3>
              <span className="card-icon">📦</span>
            </div>
            <p className="card-number">{totalProducts}</p>
            <p className="card-foot">Unique items tracked</p>
          </div>

          <div className="card card-stock">
            <div className="card-header">
              <h3>Total Stock</h3>
              <span className="card-icon">🏷️</span>
            </div>
            <p className="card-number">{totalStock.toLocaleString("en-IN")}</p>
            <p className="card-foot">Units across inventory</p>
          </div>

          <div className="card card-value">
            <div className="card-header">
              <h3>Inventory Value</h3>
              <span className="card-icon">💰</span>
            </div>
            <p className="card-number">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
            <p className="card-foot">Total stock worth</p>
          </div>

          <div className="card card-low">
            <div className="card-header">
              <h3>Low Stock Items</h3>
              <span className="card-icon">⚠️</span>
            </div>
            <p className="card-number">{lowStockProducts}</p>
            <p className="card-foot">Items below threshold</p>
          </div>
        </div>

        {/* ── ADD / EDIT FORM ── */}
        {/* [NEW] ref on section wrapper for scroll + glow animation */}
        <div className="form-section" ref={formSectionRef}>

          {/* [NEW] Edit mode badge — only visible when editing */}
          {editId && (
            <div className="edit-mode-badge">
              <span className="badge-dot" />
              Editing Product
            </div>
          )}

          {/* [IMPROVED] Heading changes dynamically; icon swaps too */}
          <h2 className="form-title">
            {editId ? "✏ Update Product" : "＋ Add Product"}
          </h2>

          {/* [IMPROVED] form wrapped in glassmorphism card via .form-card */}
          <div className={`form-card${editId ? " form-card--edit" : ""}`}>
            <form onSubmit={handleSubmit}>
              {/* [NEW] ref on first input for auto-focus */}
              <input
                ref={productNameInputRef}
                type="text"
                name="productName"
                placeholder="Product Name"
                value={formData.productName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="supplier"
                placeholder="Supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
              />

              {/* [IMPROVED] Button: amber when editing, purple when adding */}
              <button
                type="submit"
                className={editId ? "btn-submit btn-submit--edit" : "btn-submit"}
              >
                {editId ? "✓ Update Product" : "＋ Add Product"}
              </button>
            </form>
          </div>
        </div>

        <hr />

        {/* ── CHARTS (logic & JSX unchanged; CSS class hooks added) ── */}
        <DashboardCharts products={products} />

        {/* ── PRODUCTS LIST HEADER ── */}
        <div className="table-section-header">
          <h2 className="section-title">Products List</h2>
          <button className="btn-export" onClick={exportToExcel}>
            ↓ Export Excel
          </button>
        </div>

        {/* ── SEARCH + FILTER (unchanged logic) ── */}
        <div className="search-filter">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* ── TABLE ── */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                // [IMPROVED] Professional empty state card
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-state-inner">
                      <div className="empty-icon-wrap">
                        <span className="empty-icon">📦</span>
                      </div>
                      <p className="empty-title">No Products Found</p>
                      <span className="empty-sub">
                        {search || categoryFilter !== "All"
                          ? "Try adjusting your search or category filter."
                          : "Add your first product to start managing inventory."}
                      </span>
                      {!search && categoryFilter === "All" && (
                        <button
                          className="empty-cta"
                          onClick={() => {
                            formSectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            setTimeout(
                              () => productNameInputRef.current?.focus(),
                              450
                            );
                          }}
                        >
                          ＋ Add First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={Number(product.quantity) < 10 ? "low-stock" : ""}
                  >
                    <td>
                      <span className="product-name">{product.productName}</span>
                    </td>
                    <td>
                      <span className="category-pill">{product.category}</span>
                    </td>
                    <td>
                      {product.quantity}
                      <br />
                      {Number(product.quantity) < 10 ? (
                        <span className="status-low">Low Stock</span>
                      ) : (
                        <span className="status-good">In Stock</span>
                      )}
                    </td>
                    <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                    <td>{product.supplier}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-edit"
                          onClick={() => editProduct(product)}
                          title="Edit product"
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => deleteProduct(product._id)}
                          title="Delete product"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p>Smart Inventory System © 2025</p>
        <span>Built with React • Node.js • MongoDB</span>
      </footer>
    </div>
  );
}

export default App;
