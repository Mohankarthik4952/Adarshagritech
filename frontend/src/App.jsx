import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./routes/PublicRoutes";

import CustomerRoutes from "./routes/customerRoutes";

import DealerRoutes from "./routes/dealerRoutes";

import AdminRoutes from "./routes/adminRoutes";

function App() {
  return (
    <Routes>
      <Route path="/customer/*" element={<CustomerRoutes />} />

      <Route path="/dealer/*" element={<DealerRoutes />} />

      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
}

export default App;
