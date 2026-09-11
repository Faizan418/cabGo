import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;

// Custom SVG Icons for markers
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${color};
        color: #0f172a;
        font-weight: 800;
        font-size: 11px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
};

const pickupIcon = createCustomIcon('#10B981', 'P'); // Emerald Green
const destinationIcon = createCustomIcon('#F59E0B', 'D'); // Amber
const captainIcon = L.divIcon({
  className: 'captain-map-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f172a;
      color: #facc15;
      font-weight: 900;
      font-size: 16px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 3px solid #f59e0b;
      box-shadow: 0 4px 14px rgba(245,158,11,0.5);
    ">
      🚖
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

// Component to adjust bounds when coordinates change
const AutoFitBounds = ({ pickupCoords, destinationCoords, captainCoords }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickupCoords?.lat && pickupCoords?.lng) {
      points.push([pickupCoords.lat, pickupCoords.lng]);
    }
    if (destinationCoords?.lat && destinationCoords?.lng) {
      points.push([destinationCoords.lat, destinationCoords.lng]);
    }
    if (captainCoords?.lat && captainCoords?.lng) {
      points.push([captainCoords.lat, captainCoords.lng]);
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [pickupCoords, destinationCoords, captainCoords, map]);

  return null;
};

const MapView = ({
  pickupCoords,
  destinationCoords,
  captainCoords,
  className = '',
  height = '100%',
}) => {
  // Default coordinates: Lahore center [31.5204, 74.3587]
  const defaultCenter = useMemo(() => [31.5204, 74.3587], []);

  const routePolyline = useMemo(() => {
    if (pickupCoords?.lat && destinationCoords?.lat) {
      return [
        [pickupCoords.lat, pickupCoords.lng],
        [destinationCoords.lat, destinationCoords.lng],
      ];
    }
    return null;
  }, [pickupCoords, destinationCoords]);

  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 rounded-2xl shadow-inner ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {pickupCoords?.lat && pickupCoords?.lng && (
          <Marker
            position={[pickupCoords.lat, pickupCoords.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-800">
                🟢 Pickup Location
              </div>
            </Popup>
          </Marker>
        )}

        {destinationCoords?.lat && destinationCoords?.lng && (
          <Marker
            position={[destinationCoords.lat, destinationCoords.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-800">
                🏁 Destination
              </div>
            </Popup>
          </Marker>
        )}

        {captainCoords?.lat && captainCoords?.lng && (
          <Marker
            position={[captainCoords.lat, captainCoords.lng]}
            icon={captainIcon}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-800">
                🚖 Captain Live Location
              </div>
            </Popup>
          </Marker>
        )}

        {routePolyline && (
          <Polyline
            positions={routePolyline}
            color="#d97706"
            weight={4}
            opacity={0.8}
            dashArray="8, 6"
          />
        )}

        <AutoFitBounds
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          captainCoords={captainCoords}
        />
      </MapContainer>

      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-md flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-bold tracking-wide uppercase text-slate-200">
          CabGo Live Map
        </span>
      </div>
    </div>
  );
};

export default MapView;
