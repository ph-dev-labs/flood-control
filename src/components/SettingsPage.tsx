import React from "react";
import Card from "./Card";
import Buttons from "./Button";

const SettingsPage: React.FC<{ darkMode: boolean; toggleDarkMode: () => void; chartType: string; setChartType: (type: string) => void; periods: string[]; timeframe: string; setTimeframe: (period: string) => void; }> = ({
  darkMode,
  toggleDarkMode,
  chartType,
  setChartType,
  periods,
  timeframe,
  setTimeframe,
}) => (
  <div className="p-6 w-full">
    <h1 className="text-2xl font-bold mb-6">Settings</h1>
    <Card className="p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Appearance</h2>
      <div className="flex items-center justify-between py-2">
        <div>
          <h3 className="font-medium">Dark Mode</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
        </div>
        <Buttons variant="outline" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Buttons>
      </div>

      <h2 className="text-xl font-semibold my-4">Chart Settings</h2>
      <div className="flex items-center justify-between py-2">
        <div>
          <h3 className="font-medium">Default Chart Type</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred chart type</p>
        </div>
        <div className="flex gap-2">
          <Buttons variant={chartType === "line" ? "default" : "outline"} onClick={() => setChartType("line")}>
            Line
          </Buttons>
          <Buttons variant={chartType === "bar" ? "default" : "outline"} onClick={() => setChartType("bar")}>
            Bar
          </Buttons>
        </div>
      </div>

      <h2 className="text-xl font-semibold my-4">Data Settings</h2>
      <div className="flex items-center justify-between py-2">
        <div>
          <h3 className="font-medium">Default Time Period</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Set your preferred default time period</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <Buttons key={period} variant={timeframe === period ? "default" : "outline"} onClick={() => setTimeframe(period)}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Buttons>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export default SettingsPage;