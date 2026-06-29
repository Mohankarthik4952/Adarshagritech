import { useState } from "react";
import { Outlet } from "react-router-dom";

import DealerHeader from "./DealerHeader";
import DealerSidebar from "./DealerSidebar";

import Footer from "../../common/Footer";

import "./dealerLayout.css";

const DealerLayout = () => {
  // Sidebar open by default on laptop
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dealer-layout">
      {/* HEADER */}

      <DealerHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* BODY */}

      <div className="dealer-main-wrapper">
        {/* SIDEBAR */}

        <DealerSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* PAGE CONTENT */}

        <div
          className={`dealer-page-content ${
            sidebarOpen ? "" : "dealer-page-content-full"
          }`}
        >
          <Outlet />
        </div>
      </div>

      {/* FOOTER */}

      <Footer />
    </div>
  );
};

export default DealerLayout;
