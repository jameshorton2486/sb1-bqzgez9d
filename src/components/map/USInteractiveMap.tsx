import React, { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import { Map, X } from 'lucide-react';

// GeoJSON file for US states
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface StateData {
  name: string;
  resources: boolean;
  requirements: boolean;
}

export function USInteractiveMap() {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const navigate = useNavigate();

  const handleStateClick = useCallback((geo: any) => {
    const stateName = geo.properties.name;
    setSelectedState({
      name: stateName,
      resources: true,
      requirements: true
    });
  }, []);

  const handleStateHover = useCallback((geo: any) => {
    setTooltipContent(geo.properties.name);
  }, []);

  const handleNavigate = useCallback((state: string, path: 'resources' | 'requirements') => {
    navigate(`/${path}/${state.toLowerCase().replace(/\s+/g, '-')}`);
    setSelectedState(null);
  }, [navigate]);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Map className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Select a State</h2>
        </div>
      </div>

      <div className="relative bg-white rounded-lg shadow-lg p-4">
        <ComposableMap 
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          className="w-full h-auto"
          data-tooltip-id="state-tooltip"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => handleStateHover(geo)}
                  onMouseLeave={() => setTooltipContent("")}
                  onClick={() => handleStateClick(geo)}
                  style={{
                    default: {
                      fill: "#e2e8f0",
                      outline: "none",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                    },
                    hover: {
                      fill: "#93c5fd",
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 250ms",
                    },
                    pressed: {
                      fill: "#3b82f6",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>

        <Tooltip id="state-tooltip" content={tooltipContent} />

        {/* State Selection Modal */}
        {selectedState && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedState.name}
                </h3>
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedState.resources && (
                  <button
                    onClick={() => handleNavigate(selectedState.name, 'resources')}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Resources
                  </button>
                )}

                {selectedState.requirements && (
                  <button
                    onClick={() => handleNavigate(selectedState.name, 'requirements')}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Requirements
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}