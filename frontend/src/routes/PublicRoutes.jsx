import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import SelectRole from "../pages/public/SelectRole";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/select-role" element={<SelectRole />} />
    </Routes>
  );
};

export default PublicRoutes;
