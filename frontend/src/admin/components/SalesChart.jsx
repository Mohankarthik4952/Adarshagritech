// src/admin/components/SalesChart.jsx

import { useEffect, useState } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../layout/adminLayout.css";

/* =========================
   REGISTER CHART.JS MODULES
   REQUIRED FOR react-chartjs-2
========================= */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const SalesChart = () => {
  /* =========================
     STATE
  ========================= */
  const [chartData, setChartData] = useState(null);

  /* =========================
     FETCH SALES CHART DATA
  ========================= */
  useEffect(() => {
    const fetchSalesChart = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
          `${API_URL}/api/admin/dashboard/sales-chart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        /* If API not available yet,
           show sample data instead */
        if (!response.ok) {
          console.warn("Sales chart API not available. Using sample data.");

          setChartData({
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
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.15)",
                borderWidth: 3,
                tension: 0.35,
                fill: true,
              },
            ],
          });

          return;
        }

        const data = await response.json();

        /* Build chart data from API */
        setChartData({
          labels: data.map((item) => item.month),
          datasets: [
            {
              label: "Annual Sales",
              data: data.map((item) => item.sales),
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.15)",
              borderWidth: 3,
              tension: 0.35,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("SALES CHART ERROR:", error.message);

        /* Fallback data */
        setChartData({
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
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.15)",
              borderWidth: 3,
              tension: 0.35,
              fill: true,
            },
          ],
        });
      }
    };

    fetchSalesChart();
  }, []);

  /* =========================
     LOADING STATE
  ========================= */
  if (!chartData) {
    return <p>Loading chart...</p>;
  }

  /* =========================
     CHART OPTIONS
  ========================= */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      },
    },
  };

  /* =========================
     UI
  ========================= */
  return (
    <div
      style={{
        width: "100%",
        height: "350px",
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;
