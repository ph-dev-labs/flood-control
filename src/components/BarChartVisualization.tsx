import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { ForecastItem } from "../types";

// Register all Chart.js components and zoom plugin
Chart.register(...registerables, zoomPlugin);

interface BarChartVisualizationProps {
  data: ForecastItem[];
  height: string;
}

const BarChartVisualization: React.FC<BarChartVisualizationProps> = ({ data, height }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    if (chartRef.current && data && data.length > 0) {
      const ctx = chartRef.current.getContext("2d");
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.map(item => item.Date),
            datasets: [
              {
                label: "Total Precipitation",
                data: data.map(item => item.Prediction),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: "rgba(54, 162, 235, 0.8)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: "easeOutQuart",
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Prediction Value",
                  color: "#666",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                  color: "#666",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Total Precipitation Forecast",
                font: {
                  size: 16,
                  weight: "bold",
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                titleFont: {
                  size: 14,
                },
                bodyFont: {
                  size: 13,
                },
                padding: 10,
                callbacks: {
                  label: function(context) {
                    return `Prediction: ${context.parsed.y.toFixed(2)}`;
                  }
                }
              },
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 12,
                  },
                },
              },
              // Add zoom plugin configuration
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'xy',
                  threshold: 5,
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  mode: 'xy',
                },
                limits: {
                  y: {min: 'original', max: 'original', minRange: 1},
                }
              }
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Function to reset zoom
  const resetZoom = () => {
    if (chartInstance.current) {
      chartInstance.current.resetZoom();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div style={{ width: "100%", height }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="flex justify-end mt-2">
        <button 
          onClick={resetZoom} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
};

export default BarChartVisualization;