import React from "react";
import Buttons from "./Button";
import { Home, BarChart, History, Settings } from "lucide-react";

const NavigationBar: React.FC<{
  page: string;
  setPage: (page: string) => void;
  selectedCommunity: string;
}> = ({ page, setPage, selectedCommunity }) => (
  <div className="flex w-full justify-around border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 fixed bottom-0 left-0 p-2">
    <Buttons
      variant="ghost"
      onClick={() => setPage("home")}
      className={`flex flex-col items-center ${page === "home" ? "text-blue-600" : ""}`}
    >
      <Home size={24} />
      <span className="text-xs mt-1">Home</span>
    </Buttons>

    <Buttons
      variant="ghost"
      onClick={() => selectedCommunity ? setPage("prediction") : setPage("home")}
      className={`flex flex-col items-center ${page === "prediction" ? "text-blue-600" : ""}`}
    >
      <BarChart size={24} />
      <span className="text-xs mt-1">Prediction</span>
    </Buttons>

    <Buttons
      variant="ghost"
      onClick={() => setPage("history")}
      className={`flex flex-col items-center ${page === "history" ? "text-blue-600" : ""}`}
    >
      <History size={24} />
      <span className="text-xs mt-1">History</span>
    </Buttons>

    <Buttons
      variant="ghost"
      onClick={() => setPage("settings")}
      className={`flex flex-col items-center ${page === "settings" ? "text-blue-600" : ""}`}
    >
      <Settings size={24} />
      <span className="text-xs mt-1">Settings</span>
    </Buttons>
  </div>
);

export default NavigationBar;