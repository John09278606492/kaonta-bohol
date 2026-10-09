import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  AlertCircle,
  Eye,
  Gift,
  Utensils,
  Maximize2,
} from 'lucide-react';
import { BusinessWithDistance, LocationCoordinates } from '../../types';
import { formatStraightLineDistance, formatShortDistance } from '../../lib/geo';

interface LeafletMapProps {
  businesses: BusinessWithDistance[];
  userLocation: LocationCoordinates | null;
  radiusKm: number;
  selectedBusinessId?: string;
  onSelectBusiness?: (id: string) => void;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  businesses,
  userLocation,
  radiusKm,
  selectedBusinessId,
  onSelectBusiness,
  className = 'h-[500px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        // Initial center on Bohol (Tagbilaran coordinates)
        const initialLat = userLocation?.latitude || 9.6496;
        const initialLng = userLocation?.longitude || 123.8547;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: userLocation ? 13 : 11,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        // Add standard OpenStreetMap tiles with attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
          maxZoom: 18,
          minZoom: 9,
        }).addTo(map);

        // Add zoom control in top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      } catch (err: any) {
        console.error('Error initializing Leaflet map:', err);
        setMapError('Interactive map could not load. You can continue using the list directory below.');
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Location Marker and Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      const { latitude, longitude, isSimulated } = userLocation;

      // Pulse icon for user location
      const pulseColor = isSimulated ? '#F59E0B' : '#164E3D';
      const userIcon = L.divIcon({
        className: 'user-pulse-icon',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${pulseColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 20px; height: 20px; margin: 2px; border-radius: 9999px; background-color: ${pulseColor}; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        userMarkerRef.current.bindPopup(
          `<strong>${isSimulated ? 'Simulated Position' : 'Your Live Location'}</strong><br/>
           <span style="font-size: 11px; color: #555;">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</span>`
        );
      }

      // Draw Radius Circle
      const radiusMeters = radiusKm * 1000;
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setLatLng([latitude, longitude]);
        radiusCircleRef.current.setRadius(radiusMeters);
      } else {
        radiusCircleRef.current = L.circle([latitude, longitude], {
          radius: radiusMeters,
          color: '#164E3D',
          weight: 2,
          opacity: 0.8,
          fillColor: '#10B981',
          fillOpacity: 0.1,
          dashArray: '4, 4',
        }).addTo(map);
      }

      // Smoothly pan map to user position if first time or selected
      map.panTo([latitude, longitude], { animate: true, duration: 0.6 });
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
    }
  }, [userLocation, radiusKm]);

  // Update Business Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    businesses.forEach((biz) => {
      // Pin each branch or closest branch
      biz.branches.forEach((branch) => {
        const isPasalubong =
          biz.categoryId === 'pasalubong-delicacies' || biz.products.some((p) => p.isPasalubong);
        const pinColor = isPasalubong ? '#D97706' : '#164E3D';
        const isSelected = selectedBusinessId === biz.id;

        const pinHtml = `
          <div style="
            background-color: ${pinColor};
            color: white;
            padding: 6px;
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.25);
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            cursor: pointer;
          ">
            <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${
                isPasalubong
                  ? '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>'
                  : '<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><line x1="15" y1="2" x2="15" y2="22"></line><line x1="9" y1="2" x2="9" y2="22"></line>'
              }
            </svg>
          </div>
        `;

        const markerIcon = L.divIcon({
          className: 'custom-business-marker',
          html: pinHtml,
          iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
          iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
        });

        const marker = L.marker([branch.latitude, branch.longitude], {
          icon: markerIcon,
          title: biz.name,
        });

        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;

        const distanceText =
          biz.distanceKm !== undefined
            ? `<div style="font-size: 11px; font-weight: 600; color: #164E3D; margin-top: 4px;">
                 ${formatStraightLineDistance(biz.distanceKm)}
               </div>`
            : '';

        const popupContent = `
          <div style="max-width: 240px; font-family: sans-serif; padding: 2px;">
            <img src="${biz.bannerImage}" alt="${biz.name}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; letter-spacing: 0.5px;">
              ${biz.categoryName}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #111; margin-top: 2px; line-height: 1.2;">
              ${biz.name}
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">
              ${branch.branchName} • ${branch.municipality}
            </div>
            ${distanceText}
            <div style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid #eee; pt: 6px;">
              <a href="#/business/${biz.id}" style="
                flex: 1;
                display: inline-block;
                text-align: center;
                background-color: #164E3D;
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 5px 8px;
                border-radius: 6px;
                text-decoration: none;
              ">
                View Details
              </a>
              <a href="${googleMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background-color: #f3f4f6;
                color: #374151;
                font-size: 11px;
                font-weight: 600;
                padding: 5px 8px;
                border-radius: 6px;
                text-decoration: none;
              ">
                Directions ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 260 });

        marker.on('click', () => {
          if (onSelectBusiness) {
            onSelectBusiness(biz.id);
          }
        });

        markersLayer.addLayer(marker);
      });
    });
  }, [businesses, selectedBusinessId, onSelectBusiness]);

  // Center on Bohol button handler
  const resetBoholView = () => {
    if (mapInstanceRef.current) {
      if (userLocation) {
        mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
      } else {
        mapInstanceRef.current.setView([9.6496, 123.8547], 11);
      }
    }
  };

  if (mapError) {
    return (
      <div className={`${className} bg-stone-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-stone-200`}>
        <AlertCircle className="w-10 h-10 text-stone-400 mb-2" />
        <h4 className="font-bold text-stone-800 text-sm">Interactive Map Offline</h4>
        <p className="text-xs text-stone-500 max-w-sm mt-1">{mapError}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-sm border border-stone-200 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Overlay Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={resetBoholView}
          className="p-2 bg-white/95 backdrop-blur-xs hover:bg-white text-stone-800 rounded-xl shadow-md border border-stone-200 flex items-center gap-1.5 text-xs font-semibold transition-all hover:shadow-lg"
          title="Recenter on Bohol"
        >
          <Compass className="w-4 h-4 text-[#164E3D]" />
          <span className="hidden sm:inline">Center Map</span>
        </button>
      </div>

      {/* Legend pill */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-stone-200 text-[11px] text-stone-700 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#164E3D]"></span>
          Eateries & Dining
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
          Pasalubong & Snacks
        </span>
        {userLocation && (
          <span className="flex items-center gap-1 font-medium text-[#164E3D]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            {radiusKm} km radius
          </span>
        )}
      </div>
    </div>
  );
};
