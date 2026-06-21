// src/admin/components/SalesChart.jsx

import { useEffect, useMemo, useState } from "react";
import API_URL from "../../config/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

/* =========================
   REGISTER CHART MODULES
========================= */

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/* =========================
   FALLBACK DATA
========================= */

const fallbackChartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  datasets: [
    {
      label: "Annual Sales",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      borderColor: "#16a34a",
      backgroundColor: "rgba(22, 163, 74, 0.15)",

      borderWidth: 3,
      tension: 0.35,
      fill: true,
    },
  ],
};

const SalesChart = () => {
  const [chartData, setChartData] = useState(fallbackChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const controller = new AbortController();

    const fetchSalesChart = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
          `${API_URL}/api/admin/dashboard/sales-chart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },

            signal: controller.signal,
          },
        );

        if (!response.ok) {
          console.warn("Sales chart API unavailable. Using fallback data.");

          return;
        }

        const data = await response.json();

        if (!isMounted) return;

        if (!Array.isArray(data)) {
          console.warn("Invalid chart response format");

          return;
        }

        setChartData({
          labels: data.map((item) => item.month || ""),

          datasets: [
            {
              label: "Annual Sales",

              data: data.map((item) => Number(item.sales || 0)),

              borderColor: "#16a34a",
              backgroundColor: "rgba(22, 163, 74, 0.15)",

              borderWidth: 3,
              tension: 0.35,
              fill: true,

              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("SALES CHART ERROR:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSalesChart();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const options = useMemo(
    () => ({
      responsive: true,

      maintainAspectRatio: false,

      animation: false,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: {
          display: true,
          position: "top",
        },

        title: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: (value) => `₹${value}`,
          },
        },
      },
    }),
    [],
  );

  if (loading) {
    return <p>Loading chart...</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        position: "relative",
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;
