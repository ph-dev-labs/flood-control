import React from "react";
import Card from "./Card";

const HomePage: React.FC<{ communities: string[]; onCommunitySelect: (community: string) => void; loading: boolean }> = ({ communities, onCommunitySelect, loading }) => (
  <div className="p-6 w-full">
    <h1 className="text-2xl font-bold mb-6">Select a Community</h1>
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg"> Loading communities...</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {communities.map((community) => (
          <Card
            key={community}
            className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => onCommunitySelect(community)}
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

export default HomePage;