function ProductForm({
  formData,
  editId,
  formRef,
  firstInputRef,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="panel" ref={formRef}>
      <div className="section-heading">
        <h2>{editId ? "Update Product" : "Add Product"}</h2>
        {editId && (
          <button type="button" className="ghost-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>

      <form className="product-form" onSubmit={onSubmit}>
        <input
          ref={firstInputRef}
          name="productName"
          placeholder="Product name"
          value={formData.productName}
          onChange={onChange}
          required
        />
        <input
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={onChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={onChange}
          min="0"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={onChange}
          min="0"
          required
        />
        <input
          name="supplier"
          placeholder="Supplier"
          value={formData.supplier}
          onChange={onChange}
          required
        />
        <button type="submit" className="primary-action">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>
    </section>
  );
}

export default ProductForm;
