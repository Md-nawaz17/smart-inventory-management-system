function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Products",
      value: summary.totalProducts,
      note: "Unique items tracked",
    },
    {
      label: "Low Stock Items",
      value: summary.lowStockItems,
      note: "Below 10 units",
    },
    {
      label: "Total Categories",
      value: summary.totalCategories,
      note: "Product groups",
    },
    {
      label: "Inventory Value",
      value: `Rs ${Number(summary.totalInventoryValue || 0).toLocaleString(
        "en-IN"
      )}`,
      note: "Current stock worth",
    },
  ];

  return (
    <section className="dashboard-cards" aria-label="Inventory summary">
      {cards.map((card) => (
        <article className="card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.note}</small>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
