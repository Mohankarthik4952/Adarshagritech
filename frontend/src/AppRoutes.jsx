import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home";
import SelectRole from "./pages/public/SelectRole";
import AdminRoutes from "./routes/AdminRoutes";
import DealerRoutes from "./routes/DealerRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/select-role" element={<SelectRole />} />

      {/* MODULE ROUTES */}
      <Route path="/customer/*" element={<CustomerRoutes />} />
      <Route path="/dealer/*" element={<DealerRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* SAFE FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
