import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CogIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  ClockIcon, 
  CheckBadgeIcon,
  StarIcon,
  ShareIcon // 👇 Import Added
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const MachineCard = ({ machine, onBook, currentLocation }) => {
  const { t } = useTranslation();

  const getMachineTypeIcon = (type) => {
    const icons = {
      tractor: '🚜',
      harvester: '🌾',
      sprayer: '💦',
      thresher: '⚙️',
      other: '🔧'
    };
    return icons[type] || icons.other;
  };

  const renderRatingBadge = () => {
    const rating = machine.meta?.averageRating || 0;
    const count = machine.meta?.reviewCount || 0;
    const trust = machine.ownerId?.trustScore || 50;

    if (count > 0) {
      return (
        <div className="absolute top-3 left-3 bg-white bg-opacity-95 text-gray-800 px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm z-10">
          <StarIconSolid className="w-3 h-3 text-yellow-500 mr-1" />
          {rating.toFixed(1)}
          <span className="text-gray-500 font-normal ml-1">({count})</span>
        </div>
      );
    }
    
    if (trust > 70) {
      return (
        <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium flex items-center shadow-sm z-10">
          <CheckBadgeIcon className="w-3 h-3 mr-1" />
          {trust}% Trusted
        </div>
      );
    }

    return (
       <div className="absolute top-3 left-3 bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10">
          New Listing
       </div>
    );
  };

  // 👇 Share Logic
  const handleShare = (e) => {
    e.stopPropagation(); // Card click hone se roko
    const text = `Dekho bhai, ye ${machine.name} (${machine.type}) available hai ₹${machine.pricing.rate} mein. Krashi Link par book kar lo!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50 group">
        {machine.images && machine.images.length > 0 ? (
          <img 
            src={machine.images[0]} 
            alt={machine.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-200">
            <span className="text-7xl filter grayscale opacity-50">
                {getMachineTypeIcon(machine.type)}
            </span>
          </div>
        )}
        
        {renderRatingBadge()}

        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
          machine.availability 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {machine.availability ? 'Available' : 'Booked'}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{machine.name}</h3>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">
                {machine.type}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-700">
              ₹{machine.pricing.rate}
            </p>
            <span className="text-xs text-gray-500">/ {machine.pricing.unit}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 pt-2">
            <div className="flex items-center">
                <CurrencyRupeeIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                <span className="truncate capitalize">{machine.pricing.scheme}</span>
            </div>
            <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                <span className="truncate">{machine.location?.addressText || 'Nearby'}</span>
            </div>
            
            {machine.distanceKm !== undefined && (
                 <div className="flex items-center col-span-2">
                    <ClockIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>{machine.distanceKm.toFixed(1)} km away</span>
                </div>
            )}
        </div>

        {/* Footer Action Area */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
               {machine.ownerId?.name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-900 truncate w-20">{machine.ownerId?.name}</p>
              <p className="text-[10px] text-gray-500">Owner</p>
            </div>
          </div>

          <div className="flex gap-2">
              {/* 👇 Share Button */}
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                title="Share on WhatsApp"
              >
                <ShareIcon className="w-5 h-5" />
              </button>

              {/* Book Button */}
              <button
                onClick={() => onBook(machine)}
                disabled={!machine.availability}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm ${
                  machine.availability
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {machine.availability ? 'Book Now' : 'Busy'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineCard;