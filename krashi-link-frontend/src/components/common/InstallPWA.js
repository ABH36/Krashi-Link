import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, XMarkIcon, ShareIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if App is already installed (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return; // Agar pehle se app hai to button mat dikhao
    }

    // 2. Detect iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 3. Capture the Android Install Prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Debug: Console me check kar sakte hain
      console.log("✅ Install Prompt Captured!");
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    // Case A: Agar Chrome ka automatic prompt ready hai (Android)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      });
    } 
    // Case B: Agar prompt nahi hai (iOS ya Chrome ne prompt block kiya hai)
    else {
      setShowInstructions(true);
    }
  };

  // Agar app installed hai, to kuch mat dikhao
  if (isInstalled) return null;

  return (
    <>
      {/* --- MAIN INSTALL BUTTON (Hamesha Dikhega) --- */}
      <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:right-6 md:left-auto md:w-auto animate-bounce-slow">
        <div className="bg-green-600 text-white p-1 rounded-xl shadow-2xl border-2 border-green-400 flex items-center justify-between">
          
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center px-4 py-3 gap-3"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <ArrowDownTrayIcon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg leading-none">Install App</span>
              <span className="text-xs text-green-100 font-medium">किसान ऐप डाउनलोड करें</span>
            </div>
          </button>

          {/* Close (X) Button */}
          <button 
            onClick={() => setIsInstalled(true)} // Temporary dismiss
            className="p-3 hover:bg-green-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-green-200" />
          </button>
        </div>
      </div>

      {/* --- INSTRUCTION MODAL (Agar Direct Install na ho) --- */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              App कैसे इनस्टॉल करें?
            </h3>
            
            <p className="text-gray-600 mb-6 text-sm">
              आपके फ़ोन में ऐप डाउनलोड करने के लिए नीचे दिए गए स्टेप्स फॉलो करें:
            </p>

            {isIOS ? (
              // iOS (iPhone) Instructions
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ShareIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-700 font-medium text-sm">
                    1. नीचे <b>Share</b> बटन दबाएं
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600">+</div>
                  <span className="text-gray-700 font-medium text-sm">
                    2. <b>"Add to Home Screen"</b> चुनें
                  </span>
                </div>
              </div>
            ) : (
              // Android Instructions
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    1. ऊपर तीन डॉट्स <b>(Menu)</b> पर क्लिक करें
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    2. <b>"Install App"</b> या <b>"Add to Home Screen"</b> दबाएं
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200"
            >
              समझ गया (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;