import  { useState, useEffect, useRef } from "react";

const CustomLineGraph = ({ data = [], height = "300px" }) => {
  const [graphData, setGraphData] = useState([]);
  const [viewBox, setViewBox] = useState("0 0 1000 500");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Generate sample data if none is provided
  useEffect(() => {
    if (data.length === 0) {
      // Generate sample data
      const sampleData = Array.from({ length: 20 }, (_, i) => ({
        Date: `2025-${String(i + 1).padStart(2, '0')}-01`,
        Prediction: Math.random() * 100 + 50
      }));

      //@ts-ignore
      setGraphData(sampleData);
    } else {
      setGraphData(data);
    }
  }, [data]);

  // Find min and max values for scaling
      //@ts-ignore
  const minValue = Math.min(...graphData.map(item => item.Prediction || 0));
      //@ts-ignore
  const maxValue = Math.max(...graphData.map(item => item.Prediction || 0));
  const padding = 50; // Padding around the graph

  // Calculate dimensions
  const totalWidth = 1000;
  const totalHeight = 500;
  const graphWidth = totalWidth - (padding * 2);
  const graphHeight = totalHeight - (padding * 2);

  // Function to map data points to coordinates
      //@ts-ignore
  const getX = (index) => padding + (index / (graphData.length - 1)) * graphWidth;
      //@ts-ignore
  const getY = (value) => {
    const range = maxValue - minValue;
    // Handle case where all values are the same
    if (range === 0) return padding + graphHeight / 2;
    return totalHeight - padding - ((value - minValue) / range) * graphHeight;
  };

  // Generate the path data for the line
  const pathData = graphData.length > 0 
    ? graphData.map((item, index) => {
        const x = getX(index);
            //@ts-ignore
        const y = getY(item.Prediction || 0);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  // Generate area fill path
  const areaPathData = graphData.length > 0
    ? pathData + ` L ${getX(graphData.length - 1)} ${totalHeight - padding} L ${getX(0)} ${totalHeight - padding} Z`
    : '';

  // Handle wheel event for zooming
      //@ts-ignore
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom factor
    const newZoomLevel = Math.max(0.5, Math.min(5, zoomLevel * delta));
    setZoomLevel(newZoomLevel);
    
    // Adjust viewBox to zoom around mouse position
    if (svgRef.current) {
          //@ts-ignore
      const svgRect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - svgRect.left;
      const mouseY = e.clientY - svgRect.top;
      
      // Convert mouse position to SVG coordinates
      const viewBoxWidth = totalWidth / zoomLevel;
      const viewBoxHeight = totalHeight / zoomLevel;
      const newViewBoxWidth = totalWidth / newZoomLevel;
      const newViewBoxHeight = totalHeight / newZoomLevel;
      
      const xDiff = (newViewBoxWidth - viewBoxWidth) / 2;
      const yDiff = (newViewBoxHeight - viewBoxHeight) / 2;
      
      setPan({
        x: pan.x - xDiff * (mouseX / svgRect.width),
        y: pan.y - yDiff * (mouseY / svgRect.height)
      });
    }
  };

  // Handle mouse down for panning
      //@ts-ignore
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Handle mouse move for panning
      //@ts-ignore
  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      // Convert screen pixels to SVG coordinate system
      const viewBoxWidth = totalWidth / zoomLevel;
      const viewBoxHeight = totalHeight / zoomLevel;
      
      if (svgRef.current) {
            //@ts-ignore
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        
        const panX = pan.x - dx * (viewBoxWidth / svgWidth);
        const panY = pan.y - dy * (viewBoxHeight / svgHeight);
        
        setPan({ x: panX, y: panY });
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Reset zoom and pan
  const resetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Calculate the viewBox based on zoom and pan
  useEffect(() => {
    const viewBoxWidth = totalWidth / zoomLevel;
    const viewBoxHeight = totalHeight / zoomLevel;
    
    // Calculate viewBox coordinates ensuring we don't go out of bounds
    const x = Math.max(0, Math.min(totalWidth - viewBoxWidth, pan.x));
    const y = Math.max(0, Math.min(totalHeight - viewBoxHeight, pan.y));
    
    setViewBox(`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`);
  }, [zoomLevel, pan]);

  // Y-axis grid lines and labels
  const yAxisTicks = Array.from({ length: 6 }, (_, i) => {
    const value = minValue + (i / 5) * (maxValue - minValue);
    const y = getY(value);
    return { value: Math.round(value * 100) / 100, y };
  });

  // X-axis labels (every nth item to avoid overcrowding)
  const xLabelInterval = Math.max(1, Math.ceil(graphData.length / 10));
  const xAxisLabels = graphData.filter((_, i) => i % xLabelInterval === 0);

  return (
    <div className="flex flex-col w-full">
      <div 
        className="relative w-full" 
        style={{ height }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-move"
        >
          {/* Background */}
          <rect 
            x="0" 
            y="0" 
            width={totalWidth} 
            height={totalHeight} 
            fill="#f8fafc" 
          />
          
          {/* Y-axis grid lines */}
          {yAxisTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={padding}
                y1={tick.y}
                x2={totalWidth - padding}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="600"
                fill="#64748b"
              >
                {tick.value}
              </text>
            </g>
          ))}
          
          {/* X-axis grid lines and labels */}
          {xAxisLabels.map((item, i) => {
            const index = graphData.indexOf(item);
            const x = getX(index);
                //@ts-ignore
            const date = new Date(item.Date);
                //@ts-ignore
            const formattedDate = date instanceof Date && !isNaN(date) ? 
              date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 
                  //@ts-ignore
              item.Date.split('-').slice(1, 3).join('-');
              
            return (
              <g key={`x-label-${i}`}>
                <line
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={totalHeight - padding}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={totalHeight - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#64748b"
                >
                  {formattedDate}
                </text>
              </g>
            );
          })}
          
          {/* X and Y axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={totalHeight - padding}
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <line
            x1={padding}
            y1={totalHeight - padding}
            x2={totalWidth - padding}
            y2={totalHeight - padding}
            stroke="#94a3b8"
            strokeWidth="3"
          />
          
          {/* Area fill under the line */}
          <path
            d={areaPathData}
            fill="rgba(75, 192, 192, 0.2)"
            stroke="none"
          />
          
          {/* Line chart */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(75, 192, 192)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {graphData.map((item, index) => (
            <circle
              key={`point-${index}`}
              cx={getX(index)}
              cy={
                    //@ts-ignore
                getY(item.Prediction || 0)}
              r="5"
              fill="rgb(75, 192, 192)"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
      
      {/* Controls */}
      <div className="flex justify-end mt-2">
        <button 
          onClick={resetZoom} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
};

export default CustomLineGraph;