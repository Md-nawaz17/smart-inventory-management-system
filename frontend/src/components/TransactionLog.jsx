function TransactionLog({
  products,
  transactions,
  transactionForm,
  onChange,
  onSubmit,
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Sales / Purchase Log</h2>
      </div>

      <form className="transaction-form" onSubmit={onSubmit}>
        <select
          name="productId"
          value={transactionForm.productId}
          onChange={onChange}
          required
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.productName}
            </option>
          ))}
        </select>
        <select name="type" value={transactionForm.type} onChange={onChange}>
          <option value="stock-in">Stock in</option>
          <option value="stock-out">Stock out</option>
        </select>
        <input
          type="number"
          name="quantity"
          min="1"
          placeholder="Quantity"
          value={transactionForm.quantity}
          onChange={onChange}
          required
        />
        <input
          type="date"
          name="date"
          value={transactionForm.date}
          onChange={onChange}
        />
        <input
          name="note"
          placeholder="Note"
          value={transactionForm.note}
          onChange={onChange}
        />
        <button type="submit" className="primary-action">
          Record
        </button>
      </form>

      <div className="activity-list">
        {transactions.length === 0 ? (
          <p className="muted">No stock movement has been recorded yet.</p>
        ) : (
          transactions.map((transaction) => (
            <article key={transaction._id} className="activity-item">
              <div>
                <strong>{transaction.productName}</strong>
                <span>
                  {transaction.type === "stock-in" ? "Stock in" : "Stock out"} -
                  {new Date(transaction.date).toLocaleDateString("en-IN")}
                </span>
              </div>
              <b>{transaction.quantity}</b>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default TransactionLog;
