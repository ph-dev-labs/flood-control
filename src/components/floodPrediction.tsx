import React, { useState, useEffect } from "react";
import {
  Calendar,
  LineChart,
  Download,
  Sun,
  Moon,
  Home,
  History,
  Settings,
  BarChart,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

// Type definitions
interface ForecastItem {
  Date: string;
  Prediction: number;
}

interface ApiData {
  community: string;
  forecast: ForecastItem[];
}

interface HistoryItem {
  id: number;
  community: string;
  date: string;
  risk: number;
}

interface RiskInfo {
  level: string;
  color: string;
}

interface ApiValuesResponse {
  community: string[];
  period: string[];
  message: string;
}

// Sample API data as fallback
const sampleApiData: ApiData = {
  community: "Sokori",
  forecast: [
    { Date: "2025-04-15", Prediction: 8.88 },
    { Date: "2025-04-16", Prediction: 28.92 },
    { Date: "2025-04-17", Prediction: 7.89 },
    { Date: "2025-04-18", Prediction: 7.1 },
    { Date: "2025-04-19", Prediction: 35.71 },
    { Date: "2025-04-20", Prediction: 10.53 },
    { Date: "2025-04-21", Prediction: 43.84 },
  ],
};

// Fallback communities and periods
const fallbackCommunities: string[] = [
  "Ilorin",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Enugu",
  "Kaduna",
  "Ibadan",
  "Fangan",
  "Sokori",
];

const fallbackPeriods: string[] = [
  "today",
  "tomorrow",
  "week",
  "month",
  "year",
];

// Simple UI components since we're having issues with shadcn/ui
const Card: React.FC<
  React.PropsWithChildren<{ className?: string; onClick?: () => void }>
> = ({ children, className, onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md w-full ${
        className || ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const FloodPredictionApp: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [page, setPage] = useState<
    "home" | "prediction" | "history" | "settings"
  >("home");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("today");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [fullscreenChart, setFullscreenChart] = useState<boolean>(false);

  // Add state for API data and loading
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // New state for communities and periods from API
  const [communities, setCommunities] = useState<string[]>(fallbackCommunities);
  const [periods, setPeriods] = useState<string[]>(fallbackPeriods);
  const [valuesLoading, setValuesLoading] = useState<boolean>(true);

  // Fetch communities and periods from API
  useEffect(() => {
    const fetchValues = async () => {
      setValuesLoading(true);
      try {
        const response = await fetch(
          "https://chidaniel.pythonanywhere.com/api/v2/forecast/values"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch values");
        }
        const data: ApiValuesResponse = await response.json();

        if (
          data.community &&
          Array.isArray(data.community) &&
          data.community.length > 0
        ) {
          setCommunities(data.community);
        }

        if (
          data.period &&
          Array.isArray(data.period) &&
          data.period.length > 0
        ) {
          setPeriods(data.period);
          // Set default timeframe from API periods
          setTimeframe(data.period[0]);
        }
      } catch (error) {
        console.error("Error fetching communities and periods:", error);
        // Fallback to hardcoded values
        setCommunities(fallbackCommunities);
        setPeriods(fallbackPeriods);
      } finally {
        setValuesLoading(false);
      }
    };

    fetchValues();
  }, []);

  // Fetch API data when selected community or timeframe changes
  useEffect(() => {
    const fetchData = async (community: string, period: string) => {
      if (!community || !period) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://chidaniel.pythonanywhere.com/api/v2/forecast/${community.toLowerCase()}/${period.toLowerCase()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch forecast");
        }
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
        // Fallback to sample data on error
        setApiData(sampleApiData);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCommunity && timeframe) {
      fetchData(selectedCommunity, timeframe);
    }
  }, [selectedCommunity, timeframe]);

  // Toggle dark mode
  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
  };

  // Handle community selection
  const handleCommunitySelect = (community: string): void => {
    setSelectedCommunity(community);
    setPage("prediction");

    // Add to history after API data is loaded
    setTimeout(() => {
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        community,
        date: new Date().toISOString().split("T")[0],
        risk: getRiskScore(community),
      };

      setHistory([newHistoryItem, ...history]);
    }, 1000); // Wait for API data
  };

  // Get risk score based on community and timeframe
  //@ts-expect-error - not used
  const getRiskScore = (community: string): number => {
    // Use API data if available, otherwise fallback to sample data
    const forecastData = apiData?.forecast || sampleApiData.forecast;

    if (!forecastData || forecastData.length === 0) return 0;

    switch (timeframe) {
      case "today":
        return forecastData[0]?.Prediction || 0;
      case "tomorrow":
        return forecastData.length > 1
          ? forecastData[1]?.Prediction || 0
          : forecastData[0]?.Prediction || 0;
      case "week":
        // Average of first 7 days or all days if less than 7
        return parseFloat(
          (
            forecastData
              .slice(0, 7)
              .reduce((sum, item) => sum + item.Prediction, 0) /
            (forecastData.length >= 7 ? 7 : forecastData.length)
          ).toFixed(2)
        );
      case "month":
      case "year":
        // Average of all days
        return parseFloat(
          (
            forecastData.reduce((sum, item) => sum + item.Prediction, 0) /
            forecastData.length
          ).toFixed(2)
        );
      default:
        return forecastData[0]?.Prediction || 0;
    }
  };

  // Get chart data
  const getChartData = (): ForecastItem[] => {
    // Use API data if available, otherwise fallback to sample data
    return apiData?.forecast || sampleApiData.forecast;
  };

  // Risk level based on score
  const getRiskLevel = (score: number): RiskInfo => {
    if (score < 10) return { level: "Low", color: "text-green-500" };
    if (score < 20) return { level: "Moderate", color: "text-yellow-500" };
    if (score < 30) return { level: "High", color: "text-orange-500" };
    return { level: "Severe", color: "text-red-500" };
  };

  // Component for the Home Page
  const HomePage: React.FC = () => (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Select a Community</h1>
      {valuesLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading communities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {communities.map((community) => (
            <Card
              key={community}
              className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => handleCommunitySelect(community)}
            >
              <h3 className="text-lg font-medium">{community}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to view flood predictions
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // LineChart Component
  const LineChartVisualization: React.FC<{
    data: ForecastItem[];
    height: string;
  }> = ({ data, height }) => {
    // Find the maximum prediction value to scale the chart
    const maxPrediction = Math.max(...data.map((item) => item.Prediction));
    const yAxisMax = Math.ceil(maxPrediction / 10) * 10; // Round up to nearest 10

    return (
      <svg
        className={`w-full ${height}`}
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* X and Y Axes */}
        <line
          x1="50"
          y1="350"
          x2="950"
          y2="350"
          stroke="#888"
          strokeWidth="2"
        />
        <line x1="50" y1="50" x2="50" y2="350" stroke="#888" strokeWidth="2" />

        {/* X-Axis Labels */}
        {data.map((point, index) => {
          if (data.length > 20 && index % Math.ceil(data.length / 10) !== 0) {
            return null; // Show only every nth label for readability when there are many points
          }
          const x = 50 + (900 / (data.length - 1 || 1)) * index;
          return (
            <text
              key={`x-label-${index}`}
              x={x}
              y="380"
              textAnchor="middle"
              fontSize="12"
              fill={darkMode ? "#ccc" : "#666"}
            >
              {new Date(point.Date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          );
        })}

        {/* Y-Axis Labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const value = Math.round(i * (yAxisMax / 5));
          const y = 350 - (value / yAxisMax) * 300;
          return (
            <g key={`y-label-${value}`}>
              <text
                x="40"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill={darkMode ? "#ccc" : "#666"}
              >
                {value}
              </text>
              <line
                x1="50"
                y1={y}
                x2="950"
                y2={y}
                stroke="#ddd"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </g>
          );
        })}

        {/* Line */}
        <path
          d={data
            .map((point, index) => {
              const x = 50 + (900 / (data.length - 1 || 1)) * index;
              const y = 350 - (point.Prediction / yAxisMax) * 300;
              return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
        />

        {/* Area under the line */}
        <path
          d={
            data
              .map((point, index) => {
                const x = 50 + (900 / (data.length - 1 || 1)) * index;
                const y = 350 - (point.Prediction / yAxisMax) * 300;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ") +
            ` L ${
              50 + (900 / (data.length - 1 || 1)) * (data.length - 1)
            } 350 L 50 350 Z`
          }
          fill="rgba(59, 130, 246, 0.2)"
        />

        {/* Data Points */}
        {data.map((point, index) => {
          // For performance, only render points for smaller datasets
          if (
            data.length > 30 &&
            !hoveredPoint &&
            index % Math.ceil(data.length / 30) !== 0
          ) {
            return null;
          }

          const x = 50 + (900 / (data.length - 1 || 1)) * index;
          const y = 350 - (point.Prediction / yAxisMax) * 300;
          const isHovered = hoveredPoint === index;

          return (
            <g
              key={`point-${index}`}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 8 : 5}
                fill={isHovered ? "#2563eb" : "#3b82f6"}
              />

              {isHovered && (
                <g>
                  <rect
                    x={x - 75}
                    y={y - 40}
                    width="150"
                    height="30"
                    rx="5"
                    fill="rgba(0,0,0,0.8)"
                  />
                  <text
                    x={x}
                    y={y - 20}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                  >
                    Date: {point.Date} | Risk: {point.Prediction.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // BarChart Component
  const BarChartVisualization: React.FC<{
    data: ForecastItem[];
    height: string;
  }> = ({ data, height }) => {
    // Find the maximum prediction value to scale the chart
    const maxPrediction = Math.max(...data.map((item) => item.Prediction));
    const yAxisMax = Math.ceil(maxPrediction / 10) * 10; // Round up to nearest 10

    return (
      <svg
        className={`w-full ${height}`}
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* X and Y Axes */}
        <line
          x1="50"
          y1="350"
          x2="950"
          y2="350"
          stroke="#888"
          strokeWidth="2"
        />
        <line x1="50" y1="50" x2="50" y2="350" stroke="#888" strokeWidth="2" />

        {/* Y-Axis Labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const value = Math.round(i * (yAxisMax / 5));
          const y = 350 - (value / yAxisMax) * 300;
          return (
            <g key={`y-label-${value}`}>
              <text
                x="40"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill={darkMode ? "#ccc" : "#666"}
              >
                {value}
              </text>
              <line
                x1="50"
                y1={y}
                x2="950"
                y2={y}
                stroke="#ddd"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </g>
          );
        })}

        {/* Bars */}
        {data.map((point, index) => {
          // Calculate bar positions
          const barCount = Math.min(data.length, 30); // Limit number of visible bars for readability
          const barWidth = 900 / (barCount + 2); // +2 for spacing
          const spacing = barWidth * 0.2;
          const x = 50 + index * (barWidth + spacing);
          const barHeight = (point.Prediction / yAxisMax) * 300;
          const y = 350 - barHeight;
          const isHovered = hoveredPoint === index;

          // Determine bar color based on risk level
          let barColor;
          if (point.Prediction < 10) barColor = "#22c55e"; // green
          else if (point.Prediction < 20) barColor = "#eab308"; // yellow
          else if (point.Prediction < 30) barColor = "#f97316"; // orange
          else barColor = "#ef4444"; // red

          // Only render up to 30 bars for visibility
          if (index < 30) {
            return (
              <g
                key={`bar-${index}`}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth - spacing}
                  height={barHeight}
                  fill={barColor}
                  opacity={isHovered ? 1 : 0.8}
                  rx="2"
                />

                {/* X-Axis Label (only show some for readability) */}
                {(data.length <= 14 ||
                  index % Math.ceil(data.length / 14) === 0) && (
                  <text
                    x={x + (barWidth - spacing) / 2}
                    y="370"
                    textAnchor="middle"
                    fontSize="10"
                    fill={darkMode ? "#ccc" : "#666"}
                    transform={`rotate(45, ${
                      x + (barWidth - spacing) / 2
                    }, 370)`}
                  >
                    {new Date(point.Date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </text>
                )}

                {/* Value Label */}
                {data.length <= 10 && (
                  <text
                    x={x + (barWidth - spacing) / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill={darkMode ? "#ccc" : "#666"}
                  >
                    {point.Prediction.toFixed(1)}
                  </text>
                )}

                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 50}
                      y={y - 40}
                      width="150"
                      height="30"
                      rx="5"
                      fill="rgba(0,0,0,0.8)"
                    />
                    <text
                      x={x + (barWidth - spacing) / 2}
                      y={y - 20}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                    >
                      Date: {point.Date} | Risk: {point.Prediction.toFixed(2)}
                    </text>
                  </g>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* Legend for risk levels */}
        <g transform="translate(700, 60)">
          <rect x="0" y="0" width="20" height="20" fill="#22c55e" rx="2" />
          <text x="25" y="15" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>
            Low Risk (&lt;10)
          </text>

          <rect x="0" y="25" width="20" height="20" fill="#eab308" rx="2" />
          <text x="25" y="40" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>
            Moderate Risk (10-20)
          </text>

          <rect x="0" y="50" width="20" height="20" fill="#f97316" rx="2" />
          <text x="25" y="65" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>
            High Risk (20-30)
          </text>

          <rect x="0" y="75" width="20" height="20" fill="#ef4444" rx="2" />
          <text x="25" y="90" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>
            Severe Risk (&gt;30)
          </text>
        </g>
      </svg>
    );
  };

  // Component for the Prediction Results Page
  const PredictionPage: React.FC = () => {
    const chartData = getChartData();
    const riskScore = getRiskScore(selectedCommunity);
    const riskInfo = getRiskLevel(riskScore);

    // Chart height based on fullscreen mode
    //@ts-expect-error -- not used
    const chartHeight = fullscreenChart
      ? "h-screen fixed top-0 left-0 z-50 bg-white dark:bg-gray-900 p-6"
      : "h-96";

    return (
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-2">
          {selectedCommunity} Flood Prediction
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading forecast data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 w-full">
              <div className="flex flex-wrap gap-2 w-full">
                {periods.map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    onClick={() => setTimeframe(period)}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} />{" "}
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="p-6 mb-6 w-full">
              <h2 className="text-xl font-semibold mb-4">Flood Risk Score</h2>
              <div className="flex items-center justify-center mb-4">
                <div
                  className="text-6xl font-bold"
                  style={{
                    color:
                      riskScore > 30
                        ? "#ef4444"
                        : riskScore > 20
                        ? "#f97316"
                        : riskScore > 10
                        ? "#eab308"
                        : "#22c55e",
                  }}
                >
                  {riskScore.toFixed(2)}
                </div>
              </div>
              <div className="text-center mb-2">
                <span className={`text-lg font-medium ${riskInfo.color}`}>
                  {riskInfo.level} Risk
                </span>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Flood probability for {selectedCommunity} ({timeframe})
              </p>
            </Card>

            {/* Chart Selection Controls */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  onClick={() => setChartType("line")}
                  className="flex items-center gap-1"
                >
                  <LineChart size={16} /> Line Chart
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  onClick={() => setChartType("bar")}
                  className="flex items-center gap-1"
                >
                  <BarChart size={16} /> Bar Chart
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setFullscreenChart(!fullscreenChart)}
                className="flex items-center gap-1"
              >
                {fullscreenChart ? (
                  <ArrowDown size={16} />
                ) : (
                  <ArrowUp size={16} />
                )}
                {fullscreenChart ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </div>

            {/* Chart Container */}
            <Card
              className={`p-6 w-full ${
                fullscreenChart
                  ? "fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none flex flex-col"
                  : ""
              }`}
            >
              {fullscreenChart && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Prediction Trend for {selectedCommunity}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setFullscreenChart(false)}
                    className="flex items-center gap-1"
                  >
                    <ArrowDown size={16} /> Exit Fullscreen
                  </Button>
                </div>
              )}

              <h2
                className={`text-xl font-semibold mb-4 ${
                  fullscreenChart ? "hidden" : ""
                }`}
              >
                Prediction Trend
              </h2>

              <div
                className={`relative w-full ${
                  fullscreenChart ? "flex-grow" : "h-96"
                }`}
              >
                {/* Show different chart types */}
                {chartType === "line" ? (
                  <LineChartVisualization
                    data={chartData}
                    height={fullscreenChart ? "h-full" : "h-96"}
                  />
                ) : (
                  <BarChartVisualization
                    data={chartData}
                    height={fullscreenChart ? "h-full" : "h-96"}
                  />
                )}
              </div>

              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                Hover over data points to see exact values
              </div>
            </Card>

            {/* Risk Summary */}
            <Card className="p-6 mt-6 w-full">
              <h2 className="text-xl font-semibold mb-4">Risk Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Current Prediction</h3>
                  <div className="text-3xl font-bold">
                    {chartData[0]?.Prediction.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Today's flood risk value
                  </p>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Average Risk</h3>
                  <div className="text-3xl font-bold">
                    {riskScore.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Average risk for selected period
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Risk Assessment</h3>
                <p>
                  {riskScore < 10 && (
                    <>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        Low Risk:
                      </span>{" "}
                      Minimal flood risk detected for {selectedCommunity}.
                      Normal precautions advised.
                    </>
                  )}
                  {riskScore >= 10 && riskScore < 20 && (
                    <>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        Moderate Risk:
                      </span>{" "}
                      Be prepared for possible flooding in {selectedCommunity}.
                      Monitor forecasts and plan accordingly.
                    </>
                  )}
                  {riskScore >= 20 && riskScore < 30 && (
                    <>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        High Risk:
                      </span>{" "}
                      Substantial flood risk in {selectedCommunity}. Consider
                      preventive measures and stay alert.
                    </>
                  )}
                  {riskScore >= 30 && (
                    <>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        Severe Risk:
                      </span>{" "}
                      Critical flood warning for {selectedCommunity}. Take
                      immediate precautions and follow evacuation advisories if
                      issued.
                    </>
                  )}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <Button className="flex items-center gap-2">
                  <Download size={16} /> Download Forecast Data
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    );
  };

  // Component for the History Page
  const HistoryPage: React.FC = () => (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Search History</h1>
      {history.length === 0 ? (
        <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No search history available
          </p>
        </div>
      ) : (
        <div className="grid gap-4 w-full">
          {history.map((item) => {
            const riskInfo = getRiskLevel(item.risk);
            return (
              <Card
                key={item.id}
                className="p-4 flex justify-between items-center w-full"
              >
                <div>
                  <h3 className="font-medium">{item.community}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${riskInfo.color}`}>
                    {riskInfo.level}
                  </span>
                  <span className="font-bold">{item.risk.toFixed(2)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Component for the Settings Page
  const SettingsPage: React.FC = () => (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card className="p-6 w-full">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-medium">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle between light and dark theme
            </p>
          </div>
          <Button
            variant="outline"
            onClick={toggleDarkMode}
            className="flex items-center gap-2"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>

        <h2 className="text-xl font-semibold my-4">Chart Settings</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-medium">Default Chart Type</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select your preferred chart type
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              onClick={() => setChartType("line")}
              className="flex items-center gap-1"
            >
              <LineChart size={16} /> Line
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              onClick={() => setChartType("bar")}
              className="flex items-center gap-1"
            >
              <BarChart size={16} /> Bar
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold my-4">Data Settings</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-medium">Default Time Period</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set your preferred default time period
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                onClick={() => setTimeframe(period)}
                className="flex items-center gap-1"
              >
                <Calendar size={16} />{" "}
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold my-4">About</h2>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Flood Prediction App</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Version 1.0.0
            <br />
            This application provides flood risk predictions for selected
            communities based on advanced meteorological and hydrological data
            models.
          </p>
        </div>
      </Card>
    </div>
  );

  // Navigation bar component
  const NavigationBar: React.FC = () => (
    <div className="flex w-full justify-around border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 fixed bottom-0 left-0 p-2">
      <Button
        variant="ghost"
        onClick={() => setPage("home")}
        className={`flex flex-col items-center ${
          page === "home" ? "text-blue-600" : ""
        }`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() =>
          selectedCommunity ? setPage("prediction") : setPage("home")
        }
        className={`flex flex-col items-center ${
          page === "prediction" ? "text-blue-600" : ""
        }`}
      >
        <BarChart size={24} />
        <span className="text-xs mt-1">Prediction</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => setPage("history")}
        className={`flex flex-col items-center ${
          page === "history" ? "text-blue-600" : ""
        }`}
      >
        <History size={24} />
        <span className="text-xs mt-1">History</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => setPage("settings")}
        className={`flex flex-col items-center ${
          page === "settings" ? "text-blue-600" : ""
        }`}
      >
        <Settings size={24} />
        <span className="text-xs mt-1">Settings</span>
      </Button>
    </div>
  );

  return (
    <div
      className={`min-h-screen pb-16 ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Flood Prediction</h1>
            <Button variant="ghost" onClick={toggleDarkMode}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </header>

        <main className="flex flex-col items-center">
          {page === "home" && <HomePage />}
          {page === "prediction" && <PredictionPage />}
          {page === "history" && <HistoryPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>

      <NavigationBar />
    </div>
  );
};

export default FloodPredictionApp;
