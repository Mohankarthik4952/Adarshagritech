import { NavLink } from "react-router-dom";
import "./adminLayout.css";
const AdminSidebar = () => {
  return (
    <>
      <aside className="admin-sidebar">
        <ul>
          <li>
            <NavLink to="/admin/home">Home</NavLink>
          </li>
          <li>
            <NavLink to="/admin/add-product">Add Products</NavLink>
          </li>
          <li>
            <NavLink to="/admin/dealer-products">Dealer Products</NavLink>
          </li>
          <li>
            <NavLink to="/admin/customer-products">Customer Products</NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders">Orders</NavLink>
          </li>
          <li>
            <NavLink to="/admin/payments">Payment Verification</NavLink>
          </li>

          <li>
            <NavLink to="/admin/price-list">Price List</NavLink>
          </li>
          <li>
            <NavLink to="/admin/invoices">All Invoices</NavLink>
          </li>
          <li>
            <NavLink to="/admin/returns">Returns</NavLink>
          </li>
          <li>
            <NavLink to="/admin/transactions">Transaction History</NavLink>
          </li>
        </ul>
      </aside>
    </>
  );
};
export default AdminSidebar;
