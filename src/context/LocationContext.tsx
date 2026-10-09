import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  LiveNearbyStatus,
  LocationCoordinates,
} from '../types';
import {
  isWithinBohol,
  calculateStraightLineDistance,
  SIMULATION_ROUTES,
  SimulationRoute,
} from '../lib/geo';

interface LocationContextType {
  // Live status
  isLiveNearbyActive: boolean;
  status: LiveNearbyStatus;
  statusMessage: string;
  userLocation: LocationCoordinates | null;
  radiusKm: number;
  lastRefreshedAt: string | null;

  // Explanation dialog
  showPermissionExplanation: boolean;
  cancelPermissionRequest: () => void;
  confirmAndRequestPermission: () => void;

  // Actions
  enableLiveNearby: () => void;
  pauseLiveNearby: () => void;
  resumeLiveNearby: () => void;
  refreshNow: () => void;
  setRadius: (km: number) => void;

  // Manual Mode (Switches out of auto-movement so manual selection isn't overwritten)
  isManualMode: boolean;
  selectedMunicipality: string | null;
  setManualMunicipality: (municipalityName: string, lat?: number, lng?: number) => void;
  setManualLocation: (lat: number, lng: number, label?: string) => void;
  clearManualMode: () => void;

  // Dev Simulation Controls
  isSimulating: boolean;
  simulationRoutes: SimulationRoute[];
  activeSimulationRoute: SimulationRoute;
  activeStopIndex: number;
  startSimulation: (routeId?: string) => void;
  stepSimulation: (index: number) => void;
  stopSimulation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Initial fallback center in Tagbilaran City, Bohol
export const DEFAULT_BOHOL_CENTER: LocationCoordinates = {
  latitude: 9.6496,
  longitude: 123.8547,
  timestamp: Date.now(),
  isSimulated: false,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveNearbyActive, setIsLiveNearbyActive] = useState<boolean>(false);
  const [status, setStatus] = useState<LiveNearbyStatus>('idle');
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(3); // 3 km default as requested
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Permission prompt modal control
  const [showPermissionExplanation, setShowPermissionExplanation] = useState<boolean>(false);

  // Manual search mode
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeSimulationRoute, setActiveSimulationRoute] = useState<SimulationRoute>(
    SIMULATION_ROUTES[0]
  );
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  // Watch position ID reference
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<LocationCoordinates | null>(null);
  const isOnlineRef = useRef<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Updates timestamp of last successful refresh
  const markRefreshed = useCallback(() => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastRefreshedAt(timeStr);
  }, []);

  // Process and filter a new incoming coordinate
  const processNewCoordinates = useCallback(
    (coords: { latitude: number; longitude: number; accuracy?: number }, isSim = false) => {
      const { latitude, longitude, accuracy } = coords;

      // 1. Check if accuracy is usable (ignore jitter updates > 500m unless it's initial)
      if (accuracy && accuracy > 500 && lastLocationRef.current) {
        setStatus('low_accuracy');
        return;
      }

      // 2. Check micro-jitter (< 15 meters) to avoid jitter refetches
      if (lastLocationRef.current) {
        const distKm = calculateStraightLineDistance(
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
          latitude,
          longitude
        );
        if (distKm < 0.015 && !isSim) {
          // Micro movement less than 15 meters, skip redundant fetch
          return;
        }
      }

      // 3. Check if within Bohol province bounds
      const insideBohol = isWithinBohol(latitude, longitude);
      if (!insideBohol && !isSim) {
        setStatus('outside_covered_area');
        // Still store location so user can see where they are relative to Bohol
      } else if (accuracy && accuracy > 100) {
        setStatus('low_accuracy');
      } else {
        setStatus('active');
      }

      const newLoc: LocationCoordinates = {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now(),
        isSimulated: isSim,
      };

      lastLocationRef.current = newLoc;
      setUserLocation(newLoc);
      markRefreshed();
    },
    [markRefreshed]
  );

  // Start watching real device position
  const startWatchingGeolocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    // Clear any previous watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setStatus('getting_location');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (!navigator.onLine) {
          setStatus('connection_lost');
          return;
        }
        processNewCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('permission_denied');
          setIsLiveNearbyActive(false);
        } else if (error.code === error.TIMEOUT) {
          setStatus('connection_lost');
        } else {
          setStatus('connection_lost');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [processNewCoordinates]);

  // Stop watching device position
  const stopWatchingGeolocation = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Step 1: User clicks "Enable Live Nearby" -> Show explanation modal
  const enableLiveNearby = () => {
    setIsManualMode(false);
    setSelectedMunicipality(null);

    // If currently simulating, switch back to real
    if (isSimulating) {
      setIsSimulating(false);
    }

    setShowPermissionExplanation(true);
  };

  const cancelPermissionRequest = () => {
    setShowPermissionExplanation(false);
  };

  // Step 2: User confirms after reading explanation -> Trigger browser permission
  const confirmAndRequestPermission = () => {
    setShowPermissionExplanation(false);
    setIsLiveNearbyActive(true);
    startWatchingGeolocation();
  };

  const pauseLiveNearby = () => {
    stopWatchingGeolocation();
    setStatus('paused');
  };

  const resumeLiveNearby = () => {
    setIsManualMode(false);
    setSelectedMunicipality(null);
    if (isSimulating) {
      setIsSimulating(false);
    }
    setIsLiveNearbyActive(true);
    startWatchingGeolocation();
  };

  const refreshNow = () => {
    if (isSimulating) {
      const stop = activeSimulationRoute.stops[activeStopIndex];
      processNewCoordinates({ latitude: stop.lat, longitude: stop.lng }, true);
      return;
    }
    if (isLiveNearbyActive) {
      startWatchingGeolocation();
    } else {
      markRefreshed();
    }
  };

  const setRadius = (km: number) => {
    setRadiusKm(km);
    markRefreshed();
  };

  // Manual Mode Switcher (so manual selection is never overwritten by auto movements)
  const setManualMunicipality = (municipalityName: string, lat?: number, lng?: number) => {
    // Pause live watcher when manual selection takes place
    stopWatchingGeolocation();
    setIsLiveNearbyActive(false);
    setIsManualMode(true);
    setSelectedMunicipality(municipalityName);

    if (lat !== undefined && lng !== undefined) {
      const manualLoc: LocationCoordinates = {
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
        isSimulated: false,
      };
      lastLocationRef.current = manualLoc;
      setUserLocation(manualLoc);
    }
    setStatus('idle');
    markRefreshed();
  };

  const setManualLocation = (lat: number, lng: number) => {
    stopWatchingGeolocation();
    setIsLiveNearbyActive(false);
    setIsManualMode(true);
    setSelectedMunicipality(null);

    const manualLoc: LocationCoordinates = {
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
      isSimulated: false,
    };
    lastLocationRef.current = manualLoc;
    setUserLocation(manualLoc);
    setStatus('idle');
    markRefreshed();
  };

  const clearManualMode = () => {
    setIsManualMode(false);
    setSelectedMunicipality(null);
  };

  // Dev Simulation Handlers
  const startSimulation = (routeId?: string) => {
    stopWatchingGeolocation();
    setIsManualMode(false);
    setSelectedMunicipality(null);
    setIsLiveNearbyActive(true);
    setIsSimulating(true);

    const selectedRoute =
      SIMULATION_ROUTES.find((r) => r.id === routeId) || SIMULATION_ROUTES[0];
    setActiveSimulationRoute(selectedRoute);
    setActiveStopIndex(0);

    const firstStop = selectedRoute.stops[0];
    processNewCoordinates({ latitude: firstStop.lat, longitude: firstStop.lng }, true);
  };

  const stepSimulation = (index: number) => {
    if (index >= 0 && index < activeSimulationRoute.stops.length) {
      setActiveStopIndex(index);
      const stop = activeSimulationRoute.stops[index];
      processNewCoordinates({ latitude: stop.lat, longitude: stop.lng }, true);
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setIsLiveNearbyActive(false);
    setStatus('idle');
  };

  // Handle Online/Offline network events
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (isLiveNearbyActive && !isSimulating) {
        setStatus('active');
        refreshNow();
      }
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
      setStatus('connection_lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLiveNearbyActive, isSimulating]);

  // Page Visibility API: Pause location watching when tab is hidden, resume with fresh location when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isLiveNearbyActive && !isSimulating && watchIdRef.current !== null) {
          stopWatchingGeolocation();
          setStatus('paused');
        }
      } else {
        // Tab visible again: if Live Nearby was active, resume with fresh location!
        if (isLiveNearbyActive && !isSimulating) {
          startWatchingGeolocation();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLiveNearbyActive, isSimulating, startWatchingGeolocation, stopWatchingGeolocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatchingGeolocation();
    };
  }, [stopWatchingGeolocation]);

  // Human-readable status messages
  let statusMessage = 'Live Nearby inactive';
  switch (status) {
    case 'getting_location':
      statusMessage = 'Getting your location...';
      break;
    case 'active':
      statusMessage = isSimulating ? 'Simulated Route Active' : 'Live Nearby active';
      break;
    case 'permission_denied':
      statusMessage = 'Location permission denied';
      break;
    case 'low_accuracy':
      statusMessage = 'Location accuracy is low';
      break;
    case 'connection_lost':
      statusMessage = 'Connection lost (showing cached results)';
      break;
    case 'paused':
      statusMessage = 'Updates paused';
      break;
    case 'outside_covered_area':
      statusMessage = 'Movement outside Bohol covered area';
      break;
    case 'unsupported':
      statusMessage = 'Geolocation unsupported by browser';
      break;
  }

  return (
    <LocationContext.Provider
      value={{
        isLiveNearbyActive,
        status,
        statusMessage,
        userLocation,
        radiusKm,
        lastRefreshedAt,
        showPermissionExplanation,
        cancelPermissionRequest,
        confirmAndRequestPermission,
        enableLiveNearby,
        pauseLiveNearby,
        resumeLiveNearby,
        refreshNow,
        setRadius,
        isManualMode,
        selectedMunicipality,
        setManualMunicipality,
        setManualLocation,
        clearManualMode,
        isSimulating,
        simulationRoutes: SIMULATION_ROUTES,
        activeSimulationRoute,
        activeStopIndex,
        startSimulation,
        stepSimulation,
        stopSimulation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
}
