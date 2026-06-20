// src/admin/components/StatsCard.jsx

import "../layout/adminLayout.css";

const StatsCard = ({ title, value, subtitle }) => {
  /* Safe fallback values */
  const safeTitle = title || "Untitled";
  const safeValue = value !== undefined && value !== null ? value : 0;

  return (
    <div className="stats-card">
      <div className="stats-title">{safeTitle}</div>
      <div className="stats-value">{safeValue}</div>
      {subtitle ? <div className="stats-subtitle">{subtitle}</div> : null}
    </div>
  );
};

export default StatsCard;
