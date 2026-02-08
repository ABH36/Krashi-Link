import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/solid';

const VoiceSearch = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Check Browser Support on Mount
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) return;

    // HAPTIC FEEDBACK: Mobile vibrate karega (Premium Feel)
    if (navigator.vibrate) navigator.vibrate(50);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'hi-IN'; 
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      // Success Vibration
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      
      const transcript = event.results[0][0].transcript;
      const cleanText = transcript.replace(/\.$/, '');
      onSearch(cleanText);
    };

    recognition.onerror = (event) => {
      console.error('Speech error', event.error);
      setIsListening(false);
      // Error Vibration (Long)
      if (navigator.vibrate) navigator.vibrate(200);
    };

    recognition.start();
  };

  const stopListening = () => {
     // Agar user beech me rokna chahe
     window.location.reload(); // Simple refresh to stop or complex logic needed
     // Note: Simple 'stop' method implementation varies by browser, 
     // usually letting it timeout is safer for simple implementations.
     setIsListening(false);
  };

  if (!isSupported) return null; // Button hide kar do agar support nahi hai

  return (
    <div className="relative inline-flex items-center">
      {/* Listening Indicator Text */}
      {isListening && (
        <span className="absolute right-full mr-3 text-xs font-bold text-red-500 animate-pulse whitespace-nowrap bg-red-50 px-2 py-1 rounded-lg border border-red-100">
          Listening... (Boliye)
        </span>
      )}

      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full transition-all duration-300 transform active:scale-90 shadow-sm ${
          isListening 
            ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] ring-4 ring-red-100 scale-110' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
        }`}
        title="Bolkar search karein"
      >
        {isListening ? (
             // Wave animation icon can go here, but X is good for 'Stop'
             <div className="relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                 <MicrophoneIcon className="w-5 h-5 relative z-10" />
             </div>
        ) : (
             <MicrophoneIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default VoiceSearch;