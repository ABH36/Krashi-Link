import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  
  // CHANGE 1: Body Scroll Lock
  // Jab modal khule, to peeche ka page scroll nahi hona chahiye.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function: Jab modal band ho ya component hate, scroll wapas on kar do
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="relative z-50">
      
      {/* Background Overlay with BLUR Effect */}
      <div 
        className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Positioning Wrapper */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          
          {/* Modal Panel */}
          {/* Added 'animate-in fade-in zoom-in-95 duration-200' for smooth entry without libraries */}
          <div className={`
            relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all 
            sm:my-8 w-full ${sizeClasses[size]}
            animate-[fadeIn_0.2s_ease-out_forwards]
          `}>
            
            {/* CHANGE 2: Sticky Header */}
            {/* Header ab top par chipka rahega agar content lamba hai */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 sm:px-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            {/* max-h-[70vh] ensures modal never goes off-screen on mobile */}
            <div className="px-4 py-5 sm:p-6 max-h-[75vh] overflow-y-auto">
              {children}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;