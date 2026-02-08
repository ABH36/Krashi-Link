import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'; // For Navigate Button

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 🚜 Custom Tractor Icon
const tractorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2318/2318405.png', 
  iconSize: [40, 40], // Thoda bada kiya visibility ke liye
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// 🔵 User Location Icon (Pulsing Dot Effect via CSS usually, but here simple icon)
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png', // Blue Pin
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// --- 🎮 Helper Component: Map Controller ---
// Ye component map ko programmatically control karta hai
const MapController = ({ center, triggerReset }) => {
  const map = useMap();
  
  // Jab 'triggerReset' change hoga, map wapas center par fly karega
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 2 }); // Smooth Fly Animation
    }
  }, [center, triggerReset, map]);

  return null;
};

const MachineMap = ({ machines, userLocation }) => {
  const navigate = useNavigate();
  const [resetKey, setResetKey] = useState(0); // To trigger re-center

  // Safe Center Calculation
  let center = [22.9734, 78.6569]; // Default India
  if (userLocation && userLocation.lat && userLocation.lng) {
    center = [parseFloat(userLocation.lat), parseFloat(userLocation.lng)];
  }

  return (
    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50 z-0">
      
      {/* 🎯 "Re-center" Floating Button */}
      <button 
        onClick={() => setResetKey(prev => prev + 1)}
        className="absolute bottom-5 right-5 z-[400] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-transform active:scale-95 border border-gray-200"
        title="My Location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      <MapContainer 
        center={center} 
        zoom={userLocation ? 12 : 5} 
        scrollWheelZoom={false} // UX Fix: Page scroll won't get stuck
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={center} triggerReset={resetKey} />

        {/* 🗺️ PREMIUM TILES: CartoDB Voyager (Cleaner Look) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 📍 User Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={center} icon={userIcon}>
            <Popup>
              <div className="text-center font-bold text-gray-800 text-xs">
                🏠 My Farm Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* 🚜 Machine Markers */}
        {machines.map((machine, index) => {
          let lat = null;
          let lng = null;

          try {
            if (machine?.location?.coordinates?.length >= 2) {
               lng = machine.location.coordinates[0];
               lat = machine.location.coordinates[1];
            } else if (machine?.location?.lat && machine?.location?.lng) {
               lat = machine.location.lat;
               lng = machine.location.lng;
            }
          } catch (err) { return null; }

          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={machine._id || index} 
              position={[parseFloat(lat), parseFloat(lng)]}
              icon={tractorIcon}
            >
              {/* Premium Popup Card */}
              <Popup className="custom-popup">
                <div className="w-[180px] p-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{machine.name}</h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold">
                        {machine.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-xs mb-2">
                     <span className="font-bold text-gray-900 text-base mr-1">₹{machine.pricing?.rate}</span>
                     <span>/ {machine.pricing?.unit}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/farmer/book-machine/${machine._id}`)}
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <PaperAirplaneIcon className="w-3 h-3 mr-1" />
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MachineMap;