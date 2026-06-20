import { Outlet } from "react-router-dom";

import DealerHeader from "./DealerHeader";

import DealerSidebar from "./DealerSidebar";

import Footer from "../../common/Footer";

import "./dealerLayout.css";

const DealerLayout = () => {
  return (
    <div className="dealer-layout">
      {/* HEADER */}

      <DealerHeader />

      {/* BODY */}

      <div className="dealer-main-wrapper">
        {/* SIDEBAR */}

        <DealerSidebar />

        {/* PAGE CONTENT */}

        <div className="dealer-page-content">
          <Outlet />
        </div>
      </div>

      {/* FOOTER */}

      <Footer />
    </div>
  );
};

export default DealerLayout;
