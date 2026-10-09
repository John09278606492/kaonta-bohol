import React, { useState } from 'react';
import {
  Compass,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  X,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const SimulatorControl: React.FC = () => {
  const {
    isSimulating,
    simulationRoutes,
    activeSimulationRoute,
    activeStopIndex,
    startSimulation,
    stepSimulation,
    stopSimulation,
    radiusKm,
    setRadius,
  } = useLocation();

  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!isSimulating && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-2 rounded-xl shadow-lg border border-amber-300 flex items-center gap-2 text-xs transition-all"
        title="Open Dev Simulation Controls"
      >
        <Sliders className="w-4 h-4" />
        <span>Dev Simulation</span>
      </button>
    );
  }

  const currentStop = activeSimulationRoute.stops[activeStopIndex];

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden text-stone-900 animate-in slide-in-from-bottom-3 duration-200">
      {/* Simulation Header Banner */}
      <div className="bg-amber-500 text-stone-950 px-3.5 py-2 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <span>DEVELOPMENT / DEMO SIMULATION</span>
        </div>
        <button
          onClick={() => {
            if (isSimulating) stopSimulation();
            setIsOpen(false);
          }}
          className="p-1 hover:bg-amber-600 rounded-md transition-colors"
          title="Close simulation panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3 text-xs">
        <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-amber-900 leading-snug flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <span>
            Simulate moving across Bohol to verify Live Nearby radius updates, coordinate changes,
            and businesses entering/leaving the selected radius.
          </span>
        </div>

        {/* Route Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            Select Simulation Route
          </label>
          <select
            value={activeSimulationRoute.id}
            onChange={(e) => startSimulation(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {simulationRoutes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.title}
              </option>
            ))}
          </select>
        </div>

        {/* Current Stop & Stepping */}
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>
              Waypoint {activeStopIndex + 1} of {activeSimulationRoute.stops.length}
            </span>
            <span className="font-mono text-[10px]">
              {currentStop.lat.toFixed(4)}, {currentStop.lng.toFixed(4)}
            </span>
          </div>
          <div className="font-bold text-stone-900 text-sm">{currentStop.name}</div>
          <div className="text-[11px] text-stone-600">{currentStop.description}</div>
        </div>

        {/* Radius selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-stone-600">Simulated Radius:</span>
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100">
            {[1, 3, 5, 10].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadius(km)}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
                  radiusKm === km
                    ? 'bg-[#164E3D] text-white'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>

        {/* Stepper buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => stepSimulation(activeStopIndex - 1)}
            disabled={activeStopIndex <= 0}
            className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-800 font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev Stop
          </button>

          {!isSimulating ? (
            <button
              type="button"
              onClick={() => startSimulation(activeSimulationRoute.id)}
              className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-stone-950 font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Start
            </button>
          ) : (
            <button
              type="button"
              onClick={stopSimulation}
              className="flex-1 py-1.5 px-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> Stop
            </button>
          )}

          <button
            type="button"
            onClick={() => stepSimulation(activeStopIndex + 1)}
            disabled={activeStopIndex >= activeSimulationRoute.stops.length - 1}
            className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-800 font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            Next Stop <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
