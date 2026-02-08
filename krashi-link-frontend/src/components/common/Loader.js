import React from 'react';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  // Map sizes to pixel dimensions
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-[3px]', // Thoda refined border width
    lg: 'w-16 h-16 border-4',
    xl: 'w-20 h-20 border-4'
  };

  // CHANGE 1: Container logic
  // Agar fullScreen true hai, to ye poori screen lega aur center karega.
  // Nahi to normal div ki tarah behave karega.
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-8 w-full";

  return (
    <div className={containerClasses}>
      {/* CHANGE 2: Spinner styling */}
      {/* 'border-t-primary-600' is the spinning part. 'border-gray-200' is the track. */}
      <div 
        className={`animate-spin rounded-full border-gray-200 border-t-green-600 ${sizeClasses[size]}`}
        role="status"
      ></div>
      
      {/* CHANGE 3: Typography - Uppercase & Spaced out looks technical & premium */}
      {text && (
        <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;