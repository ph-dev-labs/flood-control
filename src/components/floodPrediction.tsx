// src/components/FloodPredictionApp.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, LineChart, Download, Sun, Moon, Home, History, Settings, BarChart, ArrowDown, ArrowUp } from 'lucide-react';

// Type definitions
interface ForecastItem {
  ds: string;
  seasonal: number;
  trend: number;
  yhat1: number;
}

interface ApiData {
  city: string;
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

// Sample API data as fallback
const sampleApiData: ApiData = {
  "city": "ilorin",
  "forecast": [
    {"ds":"2025-03-07","seasonal":6.1,"trend":8.9,"yhat1":18.29},
    {"ds":"2025-03-08","seasonal":3.74,"trend":9.02,"yhat1":5.22},
    {"ds":"2025-03-09","seasonal":0.97,"trend":8.1,"yhat1":11.25},
    {"ds":"2025-03-10","seasonal":2.21,"trend":10.87,"yhat1":8.25},
    {"ds":"2025-03-11","seasonal":3.15,"trend":11.56,"yhat1":13.96},
    {"ds":"2025-03-12","seasonal":3.8,"trend":10.63,"yhat1":18.31},
    {"ds":"2025-03-13","seasonal":2.26,"trend":14.12,"yhat1":15.5},
    {"ds":"2025-03-14","seasonal":0.88,"trend":8.55,"yhat1":5.44},
    {"ds":"2025-03-15","seasonal":3.54,"trend":9.27,"yhat1":12.58},
    {"ds":"2025-03-16","seasonal":4.64,"trend":14.58,"yhat1":14.01},
    {"ds":"2025-03-17","seasonal":1.33,"trend":11.18,"yhat1":5.53},
    {"ds":"2025-03-18","seasonal":6.5,"trend":14.84,"yhat1":5.09}
  ]
};

// Sample communities data
const communities: string[] = [
  "Ilorin", "Lagos", "Abuja", "Port Harcourt", "Kano", "Enugu", "Kaduna", "Ibadan"
];

// Simple UI components since we're having issues with shadcn/ui
const Card: React.FC<React.PropsWithChildren<{className?: string; onClick?: () => void}>> = ({ children, className, onClick }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md w-full ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
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
    const [page, setPage] = useState<'home' | 'prediction' | 'history' | 'settings'>('home');
    const [selectedCommunity, setSelectedCommunity] = useState<string>('');
    const [timeframe, setTimeframe] = useState<'today' | 'tomorrow' | 'week' | 'month' | 'year'>('today');
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [fullscreenChart, setFullscreenChart] = useState<boolean>(false);
    
    // Add state for API data and loading
    const [apiData, setApiData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    // Fetch API data when selected community changes
    useEffect(() => {
      const fetchData = async (community: string) => {
        setLoading(true);
        try {
          const response = await fetch(`https://chidaniel.pythonanywhere.com/api/forecast/${community.toLowerCase()}/365`);
          const data = await response.json();
          setApiData(data);
        } catch (error) {
          console.error('Error fetching forecast data:', error);
          // Fallback to sample data on error
          setApiData(sampleApiData);
        } finally {
          setLoading(false);
        }
      };
      
      if (selectedCommunity) {
        fetchData(selectedCommunity);
      }
    }, [selectedCommunity]);
    
    // Toggle dark mode
    const toggleDarkMode = (): void => {
      setDarkMode(!darkMode);
    };
    
    // Handle community selection
    const handleCommunitySelect = (community: string): void => {
      setSelectedCommunity(community);
      setPage('prediction');
      
      // Add to history after API data is loaded
      setTimeout(() => {
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          community,
          date: new Date().toISOString().split('T')[0],
          risk: getRiskScore(community, timeframe)
        };
        
        setHistory([newHistoryItem, ...history]);
      }, 1000); // Wait for API data
    };
    
    // Get risk score based on community and timeframe
    //@ts-ignore
    const getRiskScore = (community: string, timeframe: 'today' | 'tomorrow' | 'week' | 'month' | 'year'): number => {
      // Use API data if available, otherwise fallback to sample data
      const forecastData = apiData?.forecast || sampleApiData.forecast;
      
      switch(timeframe) {
        case 'today':
          return forecastData[0]?.yhat1 || 0;
        case 'tomorrow':
          return forecastData[1]?.yhat1 || 0;
        case 'week':
          // Average of first 7 days
          return parseFloat((forecastData.slice(0, 7).reduce((sum, item) => sum + item.yhat1, 0) / 
          (forecastData.length >= 7 ? 7 : forecastData.length)).toFixed(2));
        case 'month':
          // Average of all days (representing a month)
          return parseFloat((forecastData.reduce((sum, item) => sum + item.yhat1, 0) / forecastData.length).toFixed(2));
        case 'year':
          // Just return a reasonable value for demo purposes
          return parseFloat((forecastData.reduce((sum, item) => sum + item.yhat1, 0) / forecastData.length).toFixed(2));
        default:
          return 0;
      }
    };
    
    // Get data for chart based on timeframe
    const getChartData = (): ForecastItem[] => {
      // Use API data if available, otherwise fallback to sample data
      const forecastData = apiData?.forecast || sampleApiData.forecast;
      
      switch(timeframe) {
        case 'today':
          return [forecastData[0]];
        case 'tomorrow':
          return forecastData.slice(0, 2);
        case 'week':
          return forecastData.slice(0, 7);
        case 'month':
          return forecastData.slice(0, 30);
        case 'year':
          // For year, we'll use all the data we have
          return forecastData;
        default:
          return [forecastData[0]];
      }
    };
    
    // Risk level based on score
    const getRiskLevel = (score: number): RiskInfo => {
      if (score < 5) return { level: 'Low', color: 'text-green-500' };
      if (score < 10) return { level: 'Moderate', color: 'text-yellow-500' };
      if (score < 15) return { level: 'High', color: 'text-orange-500' };
      return { level: 'Severe', color: 'text-red-500' };
    };
  
    // Component for the Home Page
    const HomePage: React.FC = () => (
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Select a Community</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {communities.map(community => (
            <Card 
              key={community} 
              className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => handleCommunitySelect(community)}
            >
              <h3 className="text-lg font-medium">{community}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to view flood predictions</p>
            </Card>
          ))}
        </div>
      </div>
    );
  
    // LineChart Component
    const LineChartVisualization: React.FC<{data: ForecastItem[], height: string}> = ({ data, height }) => {
      return (
        <svg className={`w-full ${height}`} viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* X and Y Axes */}
          <line x1="50" y1="350" x2="950" y2="350" stroke="#888" strokeWidth="2" />
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
                {new Date(point.ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
          
          {/* Y-Axis Labels */}
          {[0, 5, 10, 15, 20].map((value) => {
            const y = 350 - (value / 20 * 300);
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
            d={data.map((point, index) => {
              const x = 50 + (900 / (data.length - 1 || 1)) * index;
              const y = 350 - (point.yhat1 / 20 * 300);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="#3b82f6" 
            strokeWidth="3" 
            fill="none" 
          />
          
          {/* Area under the line */}
          <path 
            d={data.map((point, index) => {
              const x = 50 + (900 / (data.length - 1 || 1)) * index;
              const y = 350 - (point.yhat1 / 20 * 300);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ` L ${50 + (900 / (data.length - 1 || 1)) * (data.length - 1)} 350 L 50 350 Z`}
            fill="rgba(59, 130, 246, 0.2)" 
          />
          
          {/* Data Points */}
          {data.map((point, index) => {
            // For performance, only render points for smaller datasets
            if (data.length > 30 && !hoveredPoint && index % Math.ceil(data.length / 30) !== 0) {
              return null;
            }
            
            const x = 50 + (900 / (data.length - 1 || 1)) * index;
            const y = 350 - (point.yhat1 / 20 * 300);
            const isHovered = hoveredPoint === index;
            
            return (
              <g key={`point-${index}`} onMouseEnter={() => setHoveredPoint(index)} onMouseLeave={() => setHoveredPoint(null)}>
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
                      Date: {point.ds} | Risk: {point.yhat1.toFixed(2)}
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
    const BarChartVisualization: React.FC<{data: ForecastItem[], height: string}> = ({ data, height }) => {
      return (
        <svg className={`w-full ${height}`} viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* X and Y Axes */}
          <line x1="50" y1="350" x2="950" y2="350" stroke="#888" strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="350" stroke="#888" strokeWidth="2" />
          
          {/* Y-Axis Labels */}
          {[0, 5, 10, 15, 20].map((value) => {
            const y = 350 - (value / 20 * 300);
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
            const x = 50 + (index * (barWidth + spacing));
            const barHeight = (point.yhat1 / 20 * 300);
            const y = 350 - barHeight;
            const isHovered = hoveredPoint === index;
            
            // Determine bar color based on risk level
            let barColor;
            if (point.yhat1 < 5) barColor = "#22c55e"; // green
            else if (point.yhat1 < 10) barColor = "#eab308"; // yellow
            else if (point.yhat1 < 15) barColor = "#f97316"; // orange
            else barColor = "#ef4444"; // red
            
            // Only render up to 30 bars for visibility
            if (index < 30) {
              return (
                <g key={`bar-${index}`} onMouseEnter={() => setHoveredPoint(index)} onMouseLeave={() => setHoveredPoint(null)}>
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
                  {(data.length <= 14 || index % Math.ceil(data.length / 14) === 0) && (
                    <text 
                      x={x + (barWidth - spacing) / 2} 
                      y="370" 
                      textAnchor="middle" 
                      fontSize="10"
                      fill={darkMode ? "#ccc" : "#666"}
                      transform={`rotate(45, ${x + (barWidth - spacing) / 2}, 370)`}
                    >
                      {new Date(point.ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                      {point.yhat1.toFixed(1)}
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
                        Date: {point.ds} | Risk: {point.yhat1.toFixed(2)}
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
            <text x="25" y="15" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>Low Risk (&lt;5)</text>
            
            <rect x="0" y="25" width="20" height="20" fill="#eab308" rx="2" />
            <text x="25" y="40" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>Moderate Risk (5-10)</text>
            
            <rect x="0" y="50" width="20" height="20" fill="#f97316" rx="2" />
            <text x="25" y="65" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>High Risk (10-15)</text>
            
            <rect x="0" y="75" width="20" height="20" fill="#ef4444" rx="2" />
            <text x="25" y="90" fontSize="12" fill={darkMode ? "#ccc" : "#666"}>Severe Risk (&gt;15)</text>
          </g>
        </svg>
      );
    };
  
    // Component for the Prediction Results Page
    const PredictionPage: React.FC = () => {
      const chartData = getChartData();
      const riskScore = getRiskScore(selectedCommunity, timeframe);
      const riskInfo = getRiskLevel(riskScore);
      
      // Chart height based on fullscreen mode
      //@ts-ignore
      const chartHeight = fullscreenChart ? 'h-screen fixed top-0 left-0 z-50 bg-white dark:bg-gray-900 p-6' : 'h-96';
      
      return (
        <div className="p-6 w-full">
          <h1 className="text-2xl font-bold mb-2">{selectedCommunity} Flood Prediction</h1>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Loading forecast data...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 w-full">
                <div className="flex flex-wrap gap-2 w-full">
                  <Button 
                    variant={timeframe === 'today' ? 'default' : 'outline'} 
                    onClick={() => setTimeframe('today')}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} /> Today
                  </Button>
                  <Button 
                    variant={timeframe === 'tomorrow' ? 'default' : 'outline'} 
                    onClick={() => setTimeframe('tomorrow')}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} /> Tomorrow
                  </Button>
                  <Button 
                    variant={timeframe === 'week' ? 'default' : 'outline'} 
                    onClick={() => setTimeframe('week')}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} /> This Week
                  </Button>
                  <Button 
                    variant={timeframe === 'month' ? 'default' : 'outline'} 
                    onClick={() => setTimeframe('month')}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} /> This Month
                  </Button>
                  <Button 
                    variant={timeframe === 'year' ? 'default' : 'outline'} 
                    onClick={() => setTimeframe('year')}
                    className="flex items-center gap-1"
                  >
                    <Calendar size={16} /> This Year
                  </Button>
                </div>
              </div>
              
              <Card className="p-6 mb-6 w-full">
                <h2 className="text-xl font-semibold mb-4">Flood Risk Score</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-6xl font-bold" style={{ color: riskScore > 15 ? '#ef4444' : riskScore > 10 ? '#f97316' : riskScore > 5 ? '#eab308' : '#22c55e' }}>
                    {riskScore.toFixed(2)}
                  </div>
                </div>
                <div className="text-center mb-2">
                  <span className={`text-lg font-medium ${riskInfo.color}`}>{riskInfo.level} Risk</span>
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Flood probability for {selectedCommunity} ({timeframe})
                </p>
              </Card>
              
              {/* Chart Selection Controls */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    variant={chartType === 'line' ? 'default' : 'outline'} 
                    onClick={() => setChartType('line')}
                    className="flex items-center gap-1"
                  >
                    <LineChart size={16} /> Line Chart
                  </Button>
                  <Button 
                    variant={chartType === 'bar' ? 'default' : 'outline'} 
                    onClick={() => setChartType('bar')}
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
                  {fullscreenChart ? <ArrowDown size={16} /> : <ArrowUp size={16} />} 
                  {fullscreenChart ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
              </div>
              
              {/* Chart Container */}
              <Card className={`p-6 w-full ${fullscreenChart ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none flex flex-col' : ''}`}>
                {fullscreenChart && (
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Prediction Trend for {selectedCommunity}</h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setFullscreenChart(false)}
                      className="flex items-center gap-1"
                    >
                      <ArrowDown size={16} /> Exit Fullscreen
                    </Button>
                  </div>
                )}
                
                <h2 className={`text-xl font-semibold mb-4 ${fullscreenChart ? 'hidden' : ''}`}>Prediction Trend</h2>
                
                <div className={`relative w-full ${fullscreenChart ? 'flex-grow' : 'h-96'}`}>
                  {/* Show different chart types */}
                  {chartType === 'line' ? (
                    <LineChartVisualization data={chartData} height={fullscreenChart ? 'h-full' : 'h-96'} />
                  ) : (
                    <BarChartVisualization data={chartData} height={fullscreenChart ? 'h-full' : 'h-96'} />
                  )}
                </div>
                
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Hover over data points to see exact values
                </div>
              </Card>
              
              {/* Component Breakdown */}
              <Card className="p-6 mt-6 w-full">
                <h2 className="text-xl font-semibold mb-4">Prediction Components</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-2">Trend Component</h3>
                    <div className="text-3xl font-bold">{chartData[0]?.trend.toFixed(2)}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      The long-term direction of flood risk
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-2">Seasonal Component</h3>
                    <div className="text-3xl font-bold">{chartData[0]?.seasonal.toFixed(2)}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      The cyclical pattern of flood risk
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-2">Overall Prediction</h3>
                    <div className="text-3xl font-bold">{chartData[0]?.yhat1.toFixed(2)}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Combined prediction of flood risk
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      );
    };
  // Component for History Page
  const HistoryPage: React.FC = () => (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">History of Past Predictions</h1>
      {history.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No prediction history yet.</p>
      ) : (
        <div className="space-y-4 w-full">
          {history.map(item => {
            const riskInfo = getRiskLevel(item.risk);
            
            return (
              <Card key={item.id} className="p-4 w-full">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className="text-lg font-medium">{item.community}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: {item.date}</p>
                    <p className="mt-1">
                      Risk Score: <span className={riskInfo.color}>{item.risk.toFixed(2)} ({riskInfo.level})</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download size={16} /> Download Report
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Component for Settings Page
  const SettingsPage: React.FC = () => (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      <Card className="p-4 w-full">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-lg font-medium">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDarkMode}
            className="flex items-center gap-1"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />} 
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </Card>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Note: No user data is stored on our servers.
      </p>
    </div>
  );

  // Main render function
  return (
    <div className={`min-h-screen flex flex-col w-full ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 w-full">
        <div className="w-full px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Flood Prediction App</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleDarkMode}
            className="text-white"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow w-full px-4 py-4">
        {page === 'home' && <HomePage />}
        {page === 'prediction' && <PredictionPage />}
        {page === 'history' && <HistoryPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
      
      {/* Footer Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 w-full">
        <div className="w-full">
          <div className="flex justify-around p-2">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center ${page === 'home' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => setPage('home')}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center ${page === 'prediction' && selectedCommunity ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => selectedCommunity && setPage('prediction')}
              disabled={!selectedCommunity}
            >
              <LineChart size={20} />
              <span className="text-xs mt-1">Predictions</span>
            </Button>
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center ${page === 'history' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => setPage('history')}
            >
              <History size={20} />
              <span className="text-xs mt-1">History</span>
            </Button>
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center ${page === 'settings' ? 'text-blue-600 dark:text-blue-400' : ''}`}
              onClick={() => setPage('settings')}
            >
              <Settings size={20} />
              <span className="text-xs mt-1">Settings</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FloodPredictionApp;