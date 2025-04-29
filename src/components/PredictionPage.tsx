import React from "react";
import Card from "./Card";
import Buttons from "./Button";
import LineChartVisualization from "./LineChartVisualization";
import BarChartVisualization from "./BarChartVisualization";
import { ApiData } from "../types";

interface PredictionPageProps {
  selectedCommunity: string;
  loading: boolean;
  apiData: ApiData | null;
  chartType: "line" | "bar";
  setChartType: (type: "line" | "bar") => void;
  fullscreenChart: boolean;
  toggleFullscreen: () => void;
  timeframe: string;
  setTimeframe: (period: string) => void;
  periods: string[];
}

const PredictionPage: React.FC<PredictionPageProps> = ({
  selectedCommunity,
  loading,
  apiData,
  chartType,
  setChartType,
  fullscreenChart,
  toggleFullscreen,
  timeframe,
  setTimeframe,
  periods,
}) => {
  if (!apiData) return null;

  // Determine which component to render based on fullscreen state
  if (fullscreenChart) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {selectedCommunity} Flood Prediction
          </h1>
          <Buttons onClick={toggleFullscreen}>Exit Fullscreen</Buttons>
        </div>

        <div className="grid grid-cols-1 gap-6 h-[calc(100vh-100px)]">
          <Card className="p-4 h-1/2">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Maximum Surface Runoff
            </h2>
            <LineChartVisualization
              //@ts-ignore
              data={apiData.maximum_surface_runoff}
              height="calc(100% - 40px)"
            />
          </Card>

          <Card className="p-4 h-1/2">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Total Precipitation
            </h2>
            <BarChartVisualization
              data={apiData.total_precipitation}
              height="calc(100% - 40px)"
            />
          </Card>
        </div>
      </div>
    );
  }

  // Regular view (non-fullscreen)
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-2">
        {selectedCommunity} Flood Prediction
      </h1>

      {/* Time Frame Selection */}
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-lg font-semibold mb-2 sm:mb-0">Time Frame</h2>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Buttons
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  onClick={() => setTimeframe(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Buttons>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading forecast data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 w-full">
              <h2 className="text-xl font-semibold mb-4">
                Maximum Surface Runoff
              </h2>
              <div className="flex items-center justify-center mb-4">
                <div
                  className="text-6xl font-bold"
                  style={{
                    color:
                      apiData.averg_maximum_surface_runoff["average risk"] > 30
                        ? "#ef4444"
                        : "#22c55e",
                  }}
                >
                  {apiData.averg_maximum_surface_runoff["average risk"].toFixed(
                    2
                  )}
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400">
                {apiData.averg_maximum_surface_runoff.message}
              </p>
            </Card>

            <Card className="p-6 w-full">
              <h2 className="text-xl font-semibold mb-4">
                Total Precipitation
              </h2>
              <div className="flex items-center justify-center mb-4">
                <div
                  className="text-6xl font-bold"
                  style={{
                    color:
                      apiData.averg_total_precipitation["average risk"] > 30
                        ? "#ef4444"
                        : "#22c55e",
                  }}
                >
                  {apiData.averg_total_precipitation["average risk"].toFixed(2)}
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400">
                {apiData.averg_total_precipitation.message}
              </p>
            </Card>
          </div>

          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Buttons
                variant={chartType === "line" ? "default" : "outline"}
                onClick={() => setChartType("line")}
              >
                Line Chart
              </Buttons>
              <Buttons
                variant={chartType === "bar" ? "default" : "outline"}
                onClick={() => setChartType("bar")}
              >
                Bar Chart
              </Buttons>
            </div>
            <Buttons onClick={toggleFullscreen}>Fullscreen</Buttons>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {chartType === "line" ? (
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">
                  Maximum Surface Runoff
                </h2>
                <LineChartVisualization
                  //@ts-ignore
                  data={apiData.maximum_surface_runoff}
                  height="300px"
                />
              </Card>
            ) : (
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">
                  Maximum Surface Runoff
                </h2>
                <BarChartVisualization
                  data={apiData.maximum_surface_runoff}
                  height="300px"
                />
              </Card>
            )}

            {chartType === "line" ? (
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">
                  Total Precipitation
                </h2>
                <LineChartVisualization
                  //@ts-ignore
                  data={apiData.total_precipitation}
                  height="300px"
                />
              </Card>
            ) : (
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">
                  Total Precipitation
                </h2>
                <BarChartVisualization
                  data={apiData.total_precipitation}
                  height="300px"
                />
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionPage;
