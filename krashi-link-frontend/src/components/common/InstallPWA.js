import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, XMarkIcon, ShareIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if App is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return; 
    }

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 3. Capture the Android Install Prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Browser ka default prompt abhi mat dikhao, user ke click par dikhayenge
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      });
    } else {
      setShowInstructions(true);
    }
  };

  // Agar app installed hai, to component null return karega (Kuch nahi dikhega)
  if (isInstalled) return null;

  return (
    <>
      {/* --- SMALL FLOATING BUTTON (Kam Jagah lega) --- */}
      {/* Desktop: Bottom Right, Mobile: Top Right (Navbar ke paas) ya Bottom Left */}
      <button
        onClick={handleInstallClick}
        className="fixed z-40 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white hover:bg-green-700 transition-all active:scale-95 animate-fade-in
        bottom-20 right-4 md:bottom-6 md:right-6" 
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span className="font-bold text-sm">App डाउनलोड करें</span>
      </button>

      {/* --- INSTRUCTION MODAL (Same as before) --- */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">App इनस्टॉल करें</h3>
            <p className="text-gray-600 mb-6 text-sm">
              बेहतर अनुभव के लिए KrishiLink को अपने फ़ोन में इनस्टॉल करें।
            </p>

            {isIOS ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ShareIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-700 font-medium text-sm">1. <b>Share</b> बटन दबाएं</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600">+</div>
                  <span className="text-gray-700 font-medium text-sm">2. <b>"Add to Home Screen"</b> चुनें</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-gray-700 font-medium text-sm">1. ऊपर तीन डॉट्स <b>(Menu)</b> पर क्लिक करें</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 font-medium text-sm">2. <b>"Install App"</b> चुनें</span>
                </div>
              </div>
            )}
            
             <button 
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;