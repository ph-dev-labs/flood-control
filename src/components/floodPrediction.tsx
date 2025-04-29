import React, { useState, useEffect } from "react";
import HomePage from "./HomePage";
import PredictionPage from "./PredictionPage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import NavigationBar from "./NavigationBar";
import Buttons from "./Button";
import { ApiData, HistoryItem } from "../types";

const FloodPredictionApp: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [page, setPage] = useState<"home" | "prediction" | "history" | "settings">("home");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("today");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [fullscreenChart, setFullscreenChart] = useState<boolean>(false);
  const [communities, setCommunities] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [valuesLoading, setValuesLoading] = useState<boolean>(true);

  // Fetch communities and periods from API
  useEffect(() => {
    const fetchValues = async () => {
      setValuesLoading(true);
      try {
        const response = await fetch("https://chidaniel.pythonanywhere.com/api/v2/forecast/values");
        if (!response.ok) throw new Error("Failed to fetch values");
        const data = await response.json();
        setCommunities(data.community || []);
        setPeriods(data.period || []);
      } catch (error) {
        console.error("Error fetching communities and periods:", error);
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
        const response = await fetch(`https://chidaniel.pythonanywhere.com/api/v2/forecast/${community.toLowerCase()}/${period.toLowerCase()}`);
        if (!response.ok) throw new Error("Failed to fetch forecast");
        const data = await response.json();
        setApiData(data);
        
        // Add to history if not already present
        const historyItem: HistoryItem = {
          id: Date.now(),
          community: data.community,
          date: new Date().toISOString(),
          risk: data.averg_maximum_surface_runoff.average_risk,
          message: data.averg_maximum_surface_runoff.message
        };
        
        setHistory(prev => {
          // Check if this community already exists in history
          const exists = prev.some(item => item.community === data.community);
          if (!exists) {
            return [...prev, historyItem];
          }
          return prev;
        });
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCommunity && timeframe) {
      fetchData(selectedCommunity, timeframe);
    }
  }, [selectedCommunity, timeframe]);

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
  };

  const handleCommunitySelect = (community: string): void => {
    setSelectedCommunity(community);
    setPage("prediction");
  };

  return (
    <div className={`min-h-screen pb-16 ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Flood Prediction</h1>
            <Buttons variant="ghost" onClick={toggleDarkMode}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Buttons>
          </div>
        </header>

        <main className="flex flex-col items-center">
          {page === "home" && <HomePage communities={communities} onCommunitySelect={handleCommunitySelect} loading={valuesLoading} />}
          {page === "prediction" && (
            <PredictionPage
              selectedCommunity={selectedCommunity}
              loading={loading}
              //@ts-ignore
              apiData={apiData}
              chartType={chartType}
              setChartType={setChartType}
              fullscreenChart={fullscreenChart}
              periods={periods}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              toggleFullscreen={() => setFullscreenChart(!fullscreenChart)}
            />
          )}
          {page === "history" && <HistoryPage history={history} />}
          {page === "settings" && (
            <SettingsPage
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              chartType={chartType}
              //@ts-ignore
              setChartType={setChartType}
              periods={periods}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          )}
        </main>
      </div>
      <NavigationBar page={page}
      //@ts-ignore
       setPage={setPage} selectedCommunity={selectedCommunity} />
    </div>
  );
};

export default FloodPredictionApp;