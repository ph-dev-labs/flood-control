import React from "react";


const HistoryPage: React.FC<{ history: any[] }> = () => (

  <div className="p-6 w-full">
    <h1 className="text-2xl font-bold mb-6">Search History</h1>
    
      <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No search history available</p>
      </div>
  </div>
);

export default HistoryPage;