import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  ClockIcon, 
  CheckBadgeIcon,
  ShareIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const MachineCard = ({ machine, onBook }) => {
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
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-md z-10 border border-gray-100">
          <StarIconSolid className="w-3.5 h-3.5 text-yellow-400 mr-1" />
          {rating.toFixed(1)} <span className="text-gray-400 font-normal ml-1">({count})</span>
        </div>
      );
    }
    
    if (trust > 70) {
      return (
        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-md z-10">
          <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" /> Trusted
        </div>
      );
    }

    return (
       <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium shadow-md z-10">
          New
       </div>
    );
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `🚜 *KrishiLink Machine Alert*\n\nDekho bhai, ye *${machine.name}* (${machine.type}) available hai.\n💰 Rate: ₹${machine.pricing.rate}/${machine.pricing.unit}\n📍 Location: ${machine.location?.addressText || 'Nearby'}\n\nBook karne ke liye KrishiLink app dekhein!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      
      {/* 🖼️ Image Section (Fixed Aspect Ratio) */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {machine.images && machine.images.length > 0 ? (
          <>
            <img 
              src={machine.images[0]} 
              alt={machine.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Photo Counter Badge */}
            {machine.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center">
                    <PhotoIcon className="w-3 h-3 mr-1" />
                    {machine.images.length} photos
                </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-100 text-emerald-200">
            <span className="text-6xl filter drop-shadow-sm mb-2">
                {getMachineTypeIcon(machine.type)}
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">No Image</span>
          </div>
        )}
        
        {renderRatingBadge()}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm border border-white/20 backdrop-blur-md ${
          machine.availability 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {machine.availability ? 'Available' : 'Booked'}
        </div>
      </div>

      {/* 📝 Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-0.5">{machine.type}</p>
            <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-green-700 transition-colors">
                {machine.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-lg font-extrabold text-gray-900">
              ₹{machine.pricing.rate}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">/ {machine.pricing.unit}</p>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <div className="flex items-center text-gray-700 font-medium col-span-2">
                <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                <span className="truncate">{machine.location?.addressText || 'Location not set'}</span>
            </div>
            
            <div className="flex items-center">
                <CurrencyRupeeIcon className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                <span className="capitalize">{machine.pricing.scheme}</span>
            </div>
            
            {machine.distanceKm !== undefined && (
                <div className="flex items-center justify-end text-gray-500">
                    <ClockIcon className="w-3.5 h-3.5 mr-1 text-orange-400" />
                    <span>{machine.distanceKm.toFixed(1)} km</span>
                </div>
            )}
        </div>

        {/* 👇 Footer Actions (Pushed to bottom) */}
        <div className="mt-auto flex items-center justify-between gap-3">
          {/* Owner Info */}
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0">
                <span className="text-xs font-bold text-gray-600">{machine.ownerId?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-2 overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate">{machine.ownerId?.name}</p>
              <p className="text-[10px] text-gray-400">Owner</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
              {/* WhatsApp Share Button */}
              <button 
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors active:scale-95"
                title="Share on WhatsApp"
              >
                <ShareIcon className="w-5 h-5" />
              </button>

              {/* Book Button */}
              <button
                onClick={() => onBook(machine)}
                disabled={!machine.availability}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 ${
                  machine.availability
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
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