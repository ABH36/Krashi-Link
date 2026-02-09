import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false); // Session dismiss check

  useEffect(() => {
    // Handler function
    const handler = (e) => {
      console.log("📢 PWA Install Event Triggered!"); // Debugging ke liye
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    // Event Listener add karna
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e) => {
    e.preventDefault();
    if (!promptInstall) {
        console.error("❌ No install prompt available");
        return;
    }
    
    promptInstall.prompt();
    
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        setSupportsPWA(false); // Button chhupa do install ke baad
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      setPromptInstall(null);
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    console.log("User dismissed the PWA popup for this session");
  };

  // Agar support nahi hai ya user ne close kar diya hai to kuch mat dikhao
  if (!supportsPWA || isDismissed) {
    return null; 
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-6 md:right-6 md:left-auto md:w-auto animate-[slideUp_0.5s_ease-out]">
      <div className="bg-white/90 backdrop-blur-md border border-green-100 p-1.5 rounded-2xl shadow-2xl flex items-center gap-2">
        
        {/* Install Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center justify-center flex-1 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all active:scale-95 group"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2 animate-bounce" />
          <div className="text-left">
            <span className="block font-bold text-sm leading-none">Install App</span>
            <span className="text-[10px] opacity-90 font-medium">Get better experience</span>
          </div>
        </button>

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default InstallPWA;