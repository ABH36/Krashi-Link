import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n';

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('hi');

  useEffect(() => {
    // Get language from localStorage or use default
    const savedLanguage = localStorage.getItem('language') || process.env.REACT_APP_DEFAULT_LANGUAGE || 'hi';
    setLanguage(savedLanguage);
  }, []);

  const setLanguage = (language) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    
    // Update document direction for RTL languages if needed
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'hi' ? 'en' : 'hi';
    setLanguage(newLanguage);
  };

  const value = {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    isHindi: currentLanguage === 'hi'
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};