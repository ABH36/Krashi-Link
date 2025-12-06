import React, { useState } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

const VoiceSearch = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'hi-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const cleanText = transcript.replace(/\.$/, ''); // Remove trailing dot
        onSearch(cleanText);
      };

      recognition.onerror = (event) => {
        console.error('Speech error', event.error);
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Browser does not support voice search.");
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-3 rounded-full transition-all duration-200 ${
        isListening 
          ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title="Bolkar search karein"
    >
      <MicrophoneIcon className="w-5 h-5" />
    </button>
  );
};

export default VoiceSearch; 