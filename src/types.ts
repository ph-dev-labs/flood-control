// types.ts

// Forecast item structure
export interface ForecastItem {
    Date: string; // Date of the prediction
    Prediction: number; // Predicted risk value
  }
  
  // API data structure for forecast response
  export interface ApiData {
    community: string; // Name of the community
    
    // Properties from the actual API response
    averg_maximum_surface_runoff: {
      "average risk": number; // The API returns "average risk" with a space
      message: string;
    };
    averg_total_precipitation: {
      "average risk": number;
      message: string;
    };
    maximum_surface_runoff: ForecastItem[] & {
      average_risk: number; // Restructured property
      message: string;
    };
    total_precipitation: ForecastItem[] & {
      average_risk: number; // Restructured property
      message: string;
    };
  }
  
  // History item structure for storing past predictions
  export interface HistoryItem {
    id: number; // Unique identifier for the history item
    community: string; // Name of the community
    date: string; // Date of the prediction
    risk: number; // Risk value for the prediction
    message: string; // Risk message associated with the prediction
  }
  
  // Risk information structure for displaying risk levels
  export interface RiskInfo {
    level: string; // Risk level (e.g., Low, Moderate, High, Severe)
    color: string; // CSS class or color code for the risk level
  }
  
  // API response structure for fetching communities and periods
  export interface ApiValuesResponse {
    community: string[]; // Array of community names
    period: string[]; // Array of time periods
    message: string; // Message from the API
  }