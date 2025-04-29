import React from "react";
import Card from "./Card";
import Buttons from "./Button";
import LineChartVisualization from "./LineChartVisualization";
import BarChartVisualization from "./BarChartVisualization";
import { ApiData } from "../types";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Extend ApiData interface to include flood status properties
interface ExtendedApiData extends ApiData {
  daily_flood_status: {
    "High Chance": string[];
    "Neutral": string[];
    "Unlikely": string[];
  };
  msr_highest_risk_day: {
    Date: string;
    Prediction: number;
  };
  tp_highest_risk_day: {
    Date: string;
    Prediction: number;
  };
}

interface PredictionPageProps {
  selectedCommunity: string;
  loading: boolean;
  apiData: ExtendedApiData | null;
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

  // Format date to a more readable form
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Determine flood status message based on risk values
  const getFloodStatusMessage = () => {
    // Check if daily_flood_status exists in the apiData
    if ('daily_flood_status' in apiData) {
      const dailyFloodStatus = (apiData as ExtendedApiData).daily_flood_status;
      
      if (dailyFloodStatus["High Chance"]?.length > 0) {
        return {
          message: "WARNING: High chance of flooding predicted!",
          icon: <AlertTriangle className="text-red-500" size={24} />,
          className: "bg-red-100 border-red-500 text-red-700"
        };
      } else if (dailyFloodStatus["Neutral"]?.length > 0) {
        return {
          message: "Moderate flood risk - stay alert",
          icon: <Clock className="text-yellow-500" size={24} />,
          className: "bg-yellow-100 border-yellow-500 text-yellow-700"
        };
      } else if (dailyFloodStatus["Unlikely"]?.length > 0) {
        return {
          message: "No flooding expected at this time",
          icon: <CheckCircle className="text-green-500" size={24} />,
          className: "bg-green-100 border-green-500 text-green-700"
        };
      }
    }
    
    // Fallback calculation based on average risk values
    const msrRisk = apiData.averg_maximum_surface_runoff["average risk"];
    const tpRisk = apiData.averg_total_precipitation["average risk"];
    const avgRisk = (msrRisk + tpRisk) / 2;
    
    if (avgRisk > 50) {
      return {
        message: "WARNING: High flood risk detected!",
        icon: <AlertTriangle className="text-red-500" size={24} />,
        className: "bg-red-100 border-red-500 text-red-700"
      };
    } else if (avgRisk > 25) {
      return {
        message: "Moderate flood risk - stay alert",
        icon: <Clock className="text-yellow-500" size={24} />,
        className: "bg-yellow-100 border-yellow-500 text-yellow-700"
      };
    } else {
      return {
        message: "Low flood risk at this time",
        icon: <CheckCircle className="text-green-500" size={24} />,
        className: "bg-green-100 border-green-500 text-green-700"
      };
    }
  };

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

  const statusInfo = getFloodStatusMessage();

  // Regular view (non-fullscreen)
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-2">
        {selectedCommunity} Flood Prediction
      </h1>

      {/* Flood Status Banner */}
      <div className={`p-4 mb-6 border-l-4 rounded flex items-center ${statusInfo.className}`}>
        <div className="mr-3">
          {statusInfo.icon}
        </div>
        <div className="font-semibold">
          {statusInfo.message}
        </div>
      </div>

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
          {/* Flood Status by Date */}
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Flood Risk Forecast</h2>
            <div className="space-y-4">
              {/* Only render this section if daily_flood_status exists */}
              {'daily_flood_status' in apiData && (
                <>
                  {(apiData as ExtendedApiData).daily_flood_status["High Chance"]?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg text-red-600 mb-2">High Chance of Flooding</h3>
                      <ul className="p-3 rounded-md">
                        {(apiData as ExtendedApiData).daily_flood_status["High Chance"].map(date => (
                          <li key={date} className="mb-1 flex items-center">
                            <AlertTriangle className="text-red-500 mr-2" size={16} />
                            {formatDate(date)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(apiData as ExtendedApiData).daily_flood_status["Neutral"]?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg text-yellow-600 mb-2">Moderate Flood Risk</h3>
                      <ul className="p-3 rounded-md">
                        {(apiData as ExtendedApiData).daily_flood_status["Neutral"].map(date => (
                          <li key={date} className="mb-1 flex items-center">
                            <Clock className="text-yellow-500 mr-2" size={16} />
                            {formatDate(date)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(apiData as ExtendedApiData).daily_flood_status["Unlikely"]?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg text-green-600 mb-2">Flooding Unlikely</h3>
                      <ul className=" p-3 rounded-md">
                        {(apiData as ExtendedApiData).daily_flood_status["Unlikely"].map(date => (
                          <li key={date} className="mb-1 flex items-center">
                            <CheckCircle className="text-green-500 mr-2" size={16} />
                            {formatDate(date)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Fallback if daily_flood_status doesn't exist */}
              {!('daily_flood_status' in apiData) && (
                <div className="text-center p-4">
                  <p>Flood risk calculated from precipitation and surface runoff data.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {
                      //@ts-ignore
                    apiData.maximum_surface_runoff.map((item: ForecastItem) => (
                      <div key={item.Date} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium">{formatDate(item.Date)}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span>Risk level:</span>
                          <span 
                            className={`font-semibold ${
                              item.Prediction > 30 ? "text-red-500" : 
                              item.Prediction > 15 ? "text-yellow-500" : "text-green-500"
                            }`}
                          >
                            {item.Prediction > 30 ? "High" : 
                             item.Prediction > 15 ? "Moderate" : "Low"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

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

          {/* Highest Risk Day Info */}
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Highest Risk Days</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display highest risk days if available */}
              {'msr_highest_risk_day' in apiData && 'tp_highest_risk_day' in apiData ? (
                <>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Highest Surface Runoff:</h3>
                    <p className="ml-4">
                      <span className="font-medium">Date:</span> {formatDate((apiData as ExtendedApiData).msr_highest_risk_day.Date)}
                    </p>
                    <p className="ml-4">
                      <span className="font-medium">Value:</span> {(apiData as ExtendedApiData).msr_highest_risk_day.Prediction.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Highest Precipitation:</h3>
                    <p className="ml-4">
                      <span className="font-medium">Date:</span> {formatDate((apiData as ExtendedApiData).tp_highest_risk_day.Date)}
                    </p>
                    <p className="ml-4">
                      <span className="font-medium">Value:</span> {(apiData as ExtendedApiData).tp_highest_risk_day.Prediction.toFixed(2)}
                    </p>
                  </div>
                </>
              ) : (
                // Fallback to calculate highest risk from available data
                <>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Highest Surface Runoff:</h3>
                    {
                        //@ts-ignore
                    apiData.maximum_surface_runoff.length > 0 && (
                      <>
                        <p className="ml-4">
                          <span className="font-medium">Date:</span> {
                              //@ts-ignore
                          formatDate(apiData.maximum_surface_runoff.reduce((max, item) => 
                              //@ts-ignore
                            item.Prediction > max.Prediction ? item : max, apiData.maximum_surface_runoff[0]).Date)}
                        </p>
                        <p className="ml-4">
                          <span className="font-medium">Value:</span> {
                              //@ts-ignore
                          apiData.maximum_surface_runoff.reduce((max, item) => 
                              //@ts-ignore
                            item.Prediction > max.Prediction ? item : max, apiData.maximum_surface_runoff[0]).Prediction.toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Highest Precipitation:</h3>
                    {
                        //@ts-ignore
                    apiData.total_precipitation.length > 0 && (
                      <>
                        <p className="ml-4">
                          <span className="font-medium">Date:</span> {
                              //@ts-ignore
                          formatDate(apiData.total_precipitation.reduce((max, item) => 
                              //@ts-ignore
                            item.Prediction > max.Prediction ? item : max, apiData.total_precipitation[0]).Date)}
                        </p>
                        <p className="ml-4">
                          <span className="font-medium">Value:</span> {
                              //@ts-ignore
                          apiData.total_precipitation.reduce((max, item) => 
                              //@ts-ignore
                            item.Prediction > max.Prediction ? item : max, apiData.total_precipitation[0]).Prediction.toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

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