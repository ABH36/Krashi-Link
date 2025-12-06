import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setSupportsPWA(false); // Hide button after install
        } else {
            console.log('User dismissed the install prompt');
        }
    });
  };

  if (!supportsPWA) {
    return null; // Agar already installed hai ya browser support nahi karta, to kuch mat dikhao
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:right-4 md:left-auto md:w-auto">
      <button
        onClick={handleInstallClick}
        className="flex items-center justify-center w-full md:w-auto bg-green-600 text-white px-4 py-3 rounded-full shadow-2xl hover:bg-green-700 transition-all animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
        <span className="font-semibold">Krashi Link App Install Karein</span>
      </button>
    </div>
  );
};

export default InstallPWA;