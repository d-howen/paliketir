import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

// Use countries data for per-country interaction
const geoUrl = 'https://unpkg.com/world-atlas@2/countries-50m.json';

const WorldMapPage: React.FC = () => {
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState(100); // Default scale
  const [zoom, setZoom] = useState(1); // Default zoom (max dezoomed)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]); // Track selected countries

  // Dynamically adjust scale based on viewport width
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const baseScale = viewportWidth; // 360° longitude / viewport width
      setScale(Math.max(80, Math.min(baseScale / 100, 150))); // Clamp between 80–150
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 8)); // Max zoom = 8
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1)); // Min zoom = 1
  };

  // Handle country click to toggle selection
  const handleGeographyClick = (geo: any, evt: React.MouseEvent) => {
    const countryName = geo.properties.name || 'Unknown';
    setSelectedCountries((prev) =>
      prev.includes(countryName)
        ? prev.filter((name) => name !== countryName) // Deselect
        : [...prev, countryName] // Select
    );
    console.log('Clicked on:', countryName);
  };

  const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
    const countryName = geo.properties.name || 'Unknown';
    setTooltipContent(countryName);
    setTooltipPosition({ x: evt.clientX, y: evt.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
  };

  return (
    <div className="relative w-full max-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: scale, // Dynamic scale to fit viewport width
        }}
        className="w-full h-full"
      >
        <ZoomableGroup center={[0, 10]} zoom={zoom} minZoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={(evt) => handleGeographyClick(geo, evt)}
                  onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: selectedCountries.includes(geo.properties.name || 'Unknown')
                        ? '#3B82F6' // Blue for selected
                        : '#D1D5DB', // Gray for unselected
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#60A5FA', // Lighter blue on hover
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                    pressed: {
                      fill: selectedCountries.includes(geo.properties.name || 'Unknown')
                        ? '#1E40AF' // Darker blue when clicked
                        : '#9CA3AF',
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
        <div
          className="absolute bg-white p-2 border border-gray-300 rounded shadow"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          {tooltipContent}
        </div>
      )}
      {/* Zoom buttons in bottom-right corner */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white text-gray-800 font-bold py-2 px-4 rounded shadow hover:bg-gray-200 transition"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white text-gray-800 font-bold py-2 px-4 rounded shadow hover:bg-gray-200 transition"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default WorldMapPage;