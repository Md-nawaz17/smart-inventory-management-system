import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function DashboardCharts({ products }) {
  // Category Data — unchanged
  const categoryData = Object.values(
    products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          quantity: 0,
        };
      }
      acc[product.category].quantity += Number(product.quantity);
      return acc;
    }, {})
  );

  // Updated to match design-system palette (works in both light & dark mode)
  const COLORS = [
    "#6366f1",
    "#10b981",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#0ea5e9",
  ];

  return (
    <div className="charts-section">
      <div className="charts-section-header">
        <h2>Inventory Analytics</h2>
      </div>

      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3>Stock by Category</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3>Category Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="quantity"
                nameKey="category"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
