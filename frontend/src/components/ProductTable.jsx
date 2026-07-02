function ProductTable({
  products,
  search,
  categoryFilter,
  stockFilter,
  categories,
  pagination,
  onSearchChange,
  onCategoryChange,
  onStockChange,
  onEdit,
  onDelete,
  onPageChange,
  onExport,
}) {
  const emptyMessage =
    search || categoryFilter !== "All" || stockFilter !== "All"
      ? "No products match the selected filters."
      : "Add your first product to start tracking inventory.";

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Products List</h2>
        <button type="button" className="ghost-action" onClick={onExport}>
          Export Excel
        </button>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search product..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(event) => onStockChange(event.target.value)}
        >
          <option value="All">All stock</option>
          <option value="in-stock">In stock</option>
          <option value="low-stock">Low stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
      </div>

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
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const quantity = Number(product.quantity);
                const status =
                  quantity === 0
                    ? "Out of Stock"
                    : quantity < 10
                      ? "Low Stock"
                      : "In Stock";

                return (
                  <tr key={product._id} className={quantity < 10 ? "warn" : ""}>
                    <td>{product.productName}</td>
                    <td>
                      <span className="pill">{product.category}</span>
                    </td>
                    <td>
                      {quantity}
                      <span className="stock-note">{status}</span>
                    </td>
                    <td>Rs {Number(product.price).toLocaleString("en-IN")}</td>
                    <td>{product.supplier}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => onEdit(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => onDelete(product._id)}
                        >
                          Delete
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

      <div className="pagination">
        <span>
          Page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalItems} items)
        </span>
        <div>
          <button
            type="button"
            disabled={pagination.currentPage <= 1}
            onClick={() => onPageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => onPageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductTable;
