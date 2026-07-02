import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import { apiRequest, clearAuth, getStoredAuth, storeAuth } from "./api";
import AuthForm from "./components/AuthForm";
import DashboardCharts from "./components/DashboardCharts";
import ProductForm from "./components/ProductForm";
import ProductTable from "./components/ProductTable";
import SummaryCards from "./components/SummaryCards";
import TransactionLog from "./components/TransactionLog";

const emptyProductForm = {
  productName: "",
  category: "",
  quantity: "",
  price: "",
  supplier: "",
};

const emptyTransactionForm = {
  productId: "",
  type: "stock-in",
  quantity: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const emptySummary = {
  totalProducts: 0,
  lowStockItems: 0,
  totalCategories: 0,
  totalInventoryValue: 0,
};

function App() {
  const initialAuth = getStoredAuth();
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [authLoading, setAuthLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [movementData, setMovementData] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyProductForm);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);

  const formSectionRef = useRef(null);
  const productNameInputRef = useRef(null);

  const authHeaders = token;

  const showMessage = useCallback((text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  }, []);

  const handleAuthSubmit = async (mode, credentials) => {
    try {
      setAuthLoading(true);
      const payload =
        mode === "login"
          ? { email: credentials.email, password: credentials.password }
          : credentials;
      const data = await apiRequest(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      storeAuth(data);
      setToken(data.token);
      setUser(data.user);
      showMessage("Signed in successfully");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    setProducts([]);
    setAllProducts([]);
    setTransactions([]);
    setCategoryData([]);
    setMovementData([]);
    setSummary(emptySummary);
    setEditId(null);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: debouncedSearch,
        category: categoryFilter,
        status: stockFilter,
      });
      const data = await apiRequest(`/products?${params.toString()}`, {}, token);

      setProducts(data.products);
      setPagination(data.pagination);
      setSummary(data.summary);
      setCategories(data.categories);
    } catch (error) {
      showMessage(error.message);
    }
  }, [
    categoryFilter,
    debouncedSearch,
    page,
    showMessage,
    stockFilter,
    token,
  ]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [exportProducts, transactionsData, analytics] = await Promise.all([
        apiRequest("/products/export", {}, token),
        apiRequest("/transactions", {}, token),
        apiRequest("/products/analytics", {}, token),
      ]);

      setAllProducts(exportProducts);
      setTransactions(transactionsData);
      setCategoryData(analytics.categoryData);
      setMovementData(analytics.movementData);
    } catch (error) {
      showMessage(error.message);
    }
  }, [showMessage, token]);

  const refreshInventory = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchDashboardData()]);
  }, [fetchDashboardData, fetchProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!authHeaders) return;
    fetchProducts();
  }, [authHeaders, fetchProducts]);

  useEffect(() => {
    if (!authHeaders) return;
    fetchDashboardData();
  }, [authHeaders, fetchDashboardData]);

  const handleProductChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    if (Number(formData.quantity) < 0 || Number(formData.price) < 0) {
      showMessage("Quantity and price cannot be negative");
      return;
    }

    try {
      const path = editId ? `/products/${editId}` : "/products/add";
      const method = editId ? "PUT" : "POST";
      const data = await apiRequest(
        path,
        {
          method,
          body: JSON.stringify(formData),
        },
        token
      );

      showMessage(data.message);
      setFormData(emptyProductForm);
      setEditId(null);
      await refreshInventory();
    } catch (error) {
      showMessage(error.message);
    }
  };

  const editProduct = (product) => {
    setEditId(product._id);
    setFormData({
      productName: product.productName,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier,
    });

    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => productNameInputRef.current?.focus(), 350);
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData(emptyProductForm);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const data = await apiRequest(
        `/products/${id}`,
        { method: "DELETE" },
        token
      );
      showMessage(data.message);
      await refreshInventory();
    } catch (error) {
      showMessage(error.message);
    }
  };

  const exportToExcel = async () => {
    const source = allProducts.length
      ? allProducts
      : await apiRequest("/products/export", {}, token);
    const worksheet = XLSX.utils.json_to_sheet(
      source.map((product) => ({
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

  const handleTransactionChange = (event) => {
    setTransactionForm({
      ...transactionForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await apiRequest(
        "/transactions",
        {
          method: "POST",
          body: JSON.stringify(transactionForm),
        },
        token
      );
      showMessage(data.message);
      setTransactionForm(emptyTransactionForm);
      await refreshInventory();
    } catch (error) {
      showMessage(error.message);
    }
  };

  if (!token || !user) {
    return (
      <div className={darkMode ? "app dark-mode" : "app"}>
        <nav className="navbar">
          <div className="logo">Smart Inventory</div>
          <button type="button" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light" : "Dark"}
          </button>
        </nav>
        {message && <div className="toast">{message}</div>}
        <AuthForm onSubmit={handleAuthSubmit} loading={authLoading} />
      </div>
    );
  }

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <nav className="navbar">
        <div className="logo">Smart Inventory</div>
        <div className="nav-actions">
          <span className="notification-badge">
            Low stock: {summary.lowStockItems}
          </span>
          <span className="user-chip">{user.name}</span>
          <button type="button" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light" : "Dark"}
          </button>
          <button type="button" className="ghost-action" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="toast">{message}</div>}

      <main className="container">
        <section className="hero-section">
          <h1>Inventory Management System</h1>
          <p className="muted">
            Track stock levels, movements, low-stock alerts, and total inventory
            value from one dashboard.
          </p>
        </section>

        <SummaryCards summary={summary} />

        <ProductForm
          formData={formData}
          editId={editId}
          formRef={formSectionRef}
          firstInputRef={productNameInputRef}
          onChange={handleProductChange}
          onSubmit={handleProductSubmit}
          onCancel={cancelEdit}
        />

        <DashboardCharts
          categoryData={categoryData}
          movementData={movementData}
        />

        <ProductTable
          products={products}
          search={search}
          categoryFilter={categoryFilter}
          stockFilter={stockFilter}
          categories={categories}
          pagination={pagination}
          onSearchChange={setSearch}
          onCategoryChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
          onStockChange={(value) => {
            setStockFilter(value);
            setPage(1);
          }}
          onEdit={editProduct}
          onDelete={deleteProduct}
          onPageChange={setPage}
          onExport={exportToExcel}
        />

        <TransactionLog
          products={allProducts}
          transactions={transactions}
          transactionForm={transactionForm}
          onChange={handleTransactionChange}
          onSubmit={handleTransactionSubmit}
        />
      </main>

      <footer className="footer">
        <p>Smart Inventory System 2026</p>
        <span>Built with React, Node.js, Express, and MongoDB</span>
      </footer>
    </div>
  );
}

export default App;
