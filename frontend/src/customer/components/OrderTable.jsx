const OrderTable = ({ orders }) => {
  return (
    <table className="simple-table">
      <thead>
        <tr>
          <th>Order Date</th>
          <th>Product</th>
          <th>Acres</th>
          <th>Bottles</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.date}</td>
            <td>{order.product}</td>
            <td>{order.acres}</td>
            <td>{order.bottles}</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
