import { useNavigate, useLocation } from "react-router-dom";

import { FaUser, FaStore, FaArrowLeft } from "react-icons/fa";

import "../../pages/public/public.css";

const SelectRole = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     GET ACTION
  ========================= */

  const action = location.state?.action || "login";

  /* =========================
     HANDLE ROLE
  ========================= */

  const handleSelect = (role) => {
    navigate(`/${role}/${action}`);
  };

  return (
    <div className="role-page">
      {/* BACK BUTTON */}

      <button className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        Back
      </button>

      {/* TITLE */}

      <div className="role-header">
        <h1>Select Your Role</h1>

        <p>Continue as Customer or Dealer</p>
      </div>

      {/* ROLE CONTAINER */}

      <div className="role-container">
        {/* CUSTOMER */}

        <div className="role-card" onClick={() => handleSelect("customer")}>
          <div className="role-icon customer-icon">
            <FaUser />
          </div>

          <h2>Customer</h2>

          <p>Buy agricultural products easily through our platform.</p>

          <button>Continue</button>
        </div>

        {/* DEALER */}

        <div className="role-card" onClick={() => handleSelect("dealer")}>
          <div className="role-icon dealer-icon">
            <FaStore />
          </div>

          <h2>Dealer</h2>

          <p>Manage bulk orders and dealer operations efficiently.</p>

          <button>Continue</button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
