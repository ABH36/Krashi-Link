import React from 'react';

const SplashScreen = () => {
  return (
    // Full Screen Overlay with Green Gradient
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100 flex flex-col items-center justify-center z-[9999] animate-[fadeIn_0.5s_ease-out]">
      
      <div className="flex flex-col items-center">
        {/* ✅ LOGO.PNG (Make sure logo.png is in 'public' folder) */}
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <img 
                src="/logo.png" 
                alt="KrishiLink Logo" 
                className="w-28 h-28 md:w-36 md:h-36 relative z-10 drop-shadow-xl animate-[bounce_2s_infinite]"
            />
        </div>
        
        {/* App Name */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 tracking-tight mb-2">
          KrishiLink
        </h1>
        
        <p className="text-green-600 text-sm font-semibold tracking-widest uppercase">
          Connecting Farmers & Owners
        </p>

        {/* Loading Indicator (Dots) */}
        <div className="flex space-x-2 mt-8">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 text-xs text-green-400 font-medium">
        Made for Indian Agriculture 🇮🇳
      </div>
    </div>
  );
};

export default SplashScreen;About.jsx