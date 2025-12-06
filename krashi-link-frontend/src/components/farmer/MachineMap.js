import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Tractor Icon
const tractorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2318/2318405.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const MachineMap = ({ machines, userLocation }) => {
  const navigate = useNavigate();

  // Safe Center Calculation
  let center = [22.9734, 78.6569]; // Default India
  if (userLocation && userLocation.lat && userLocation.lng) {
    center = [parseFloat(userLocation.lat), parseFloat(userLocation.lng)];
  }

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
      <MapContainer 
        center={center} 
        zoom={userLocation ? 11 : 5} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={center}>
            <Popup>
              <div className="text-center font-bold text-blue-600">📍 Aap Yahan Hain</div>
            </Popup>
          </Marker>
        )}

        {/* Machine Markers with BULLETPROOF Safety Checks */}
        {machines.map((machine, index) => {
          let lat = null;
          let lng = null;

          // --- 🛡️ SAFE DATA EXTRACTION ---
          try {
            // Check 1: GeoJSON Format (coordinates array)
            if (machine?.location?.coordinates && Array.isArray(machine.location.coordinates) && machine.location.coordinates.length >= 2) {
               lng = machine.location.coordinates[0];
               lat = machine.location.coordinates[1];
            } 
            // Check 2: Flat Format (lat, lng properties)
            else if (machine?.location?.lat && machine?.location?.lng) {
               lat = machine.location.lat;
               lng = machine.location.lng;
            }
          } catch (err) {
            console.warn("Skipping machine with bad data:", machine.name);
            return null;
          }

          // Final Check: Agar Lat/Lng number nahi hai, to skip karo
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            // Console me check karo ki kaunsi machine data kharab kar rahi hai
            console.warn(`Skipping Invalid Location for Machine: ${machine.name || 'Unknown'}`);
            return null;
          }

          return (
            <Marker 
              key={machine._id || index} 
              position={[parseFloat(lat), parseFloat(lng)]}
              icon={tractorIcon}
            >
              <Popup>
                <div className="min-w-[150px] text-center">
                  <h3 className="font-bold text-gray-900 text-sm">{machine.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{machine.type}</p>
                  <p className="text-green-600 font-bold my-1">₹{machine.pricing?.rate}/{machine.pricing?.unit}</p>
                  <button
                    onClick={() => navigate(`/farmer/book-machine/${machine._id}`)}
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded mt-1 hover:bg-blue-700 w-full"
                  >
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