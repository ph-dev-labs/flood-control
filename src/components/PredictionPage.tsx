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
}

const PredictionPage: React.FC<PredictionPageProps> = ({
  selectedCommunity,
  loading,
  apiData,
  fullscreenChart,
  toggleFullscreen,
}) => {
  if (!apiData) return null;

  // Calculate risk level for styling and text
  const getSeverityLevel = (risk: number) => {
    if (risk > 65) return { color: "#dc2626", text: "Critical" };
    if (risk > 45) return { color: "#ea580c", text: "High" };
    if (risk > 30) return { color: "#ca8a04", text: "Moderate" };
    return { color: "#16a34a", text: "Low" };
  };

  // Get risk level for both metrics
  const runoffRisk = getSeverityLevel(apiData.averg_maximum_surface_runoff["average risk"]);
  const precipRisk = getSeverityLevel(apiData.averg_total_precipitation["average risk"]);

  // Determine which component to render based on fullscreen state
  if (fullscreenChart) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCommunity} Flood Prediction Analysis
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time flood risk assessment and visualization
            </p>
          </div>
          <Buttons onClick={toggleFullscreen} className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
            Exit Fullscreen
          </Buttons>
        </div>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 gap-8 h-full">
            <Card className="p-6 flex-1 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Maximum Surface Runoff</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${runoffRisk.color}20`, color: runoffRisk.color }}>
                  {runoffRisk.text} Risk
                </div>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <LineChartVisualization
                  data={apiData.maximum_surface_runoff}
                  height="100%"
                />
              </div>
            </Card>
            
            <Card className="p-6 flex-1 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Total Precipitation</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${precipRisk.color}20`, color: precipRisk.color }}>
                  {precipRisk.text} Risk
                </div>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <BarChartVisualization
                  data={apiData.total_precipitation}
                  height="100%"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Regular view (non-fullscreen)
  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCommunity} Flood Prediction Analysis
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time flood risk assessment and visualization
          </p>
        </div>
        
        {!loading && (
          <Buttons 
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Expand Analysis View
          </Buttons>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-3"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading forecast data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Maximum Surface Runoff</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${runoffRisk.color}20`, color: runoffRisk.color }}>
                  {runoffRisk.text} Risk
                </div>
              </div>
              
              <div className="flex items-center justify-center my-6">
                <div className="text-6xl font-bold" style={{ color: runoffRisk.color }}>
                  {apiData.averg_maximum_surface_runoff["average risk"].toFixed(1)}
                </div>
              </div>
              
              <div className="text-center text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {apiData.averg_maximum_surface_runoff.message}
              </div>
            </Card>

            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Total Precipitation</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${precipRisk.color}20`, color: precipRisk.color }}>
                  {precipRisk.text} Risk
                </div>
              </div>
              
              <div className="flex items-center justify-center my-6">
                <div className="text-6xl font-bold" style={{ color: precipRisk.color }}>
                  {apiData.averg_total_precipitation["average risk"].toFixed(1)}
                </div>
              </div>
              
              <div className="text-center text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {apiData.averg_total_precipitation.message}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Maximum Surface Runoff</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${runoffRisk.color}20`, color: runoffRisk.color }}>
                  {runoffRisk.text} Risk
                </div>
              </div>
              <div className="h-[400px]">
                <LineChartVisualization
                  data={apiData.maximum_surface_runoff}
                  height="100%"
                />
              </div>
            </Card>
            
            <Card className="p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Total Precipitation</h2>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${precipRisk.color}20`, color: precipRisk.color }}>
                  {precipRisk.text} Risk
                </div>
              </div>
              <div className="h-[400px]">
                <BarChartVisualization
                  data={apiData.total_precipitation}
                  height="100%"
                />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionPage;