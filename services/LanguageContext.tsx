import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    heroTitle: 'آرایشگاه استایل‌فلو (StyleFlow)',
    heroSubtitle: 'تجربه‌ای متفاوت از پیرایش و استایل در محیطی حرفه‌ای',
    bookNow: 'رزرو نوبت',
    adminPanel: 'پنل مدیریت',
    services: 'خدمات ما',
    aboutUs: 'درباره پروژه',
    contact: 'تماس با ما',
    footerText: 'تمامی حقوق محفوظ است.',
    signature: 'توسعه یافته توسط @ErPyCode',
    switchLang: 'English'
  },
  en: {
    heroTitle: 'StyleFlow Barbershop',
    heroSubtitle: 'A unique grooming and styling experience in a professional environment',
    bookNow: 'Book Appointment',
    adminPanel: 'Admin Panel',
    services: 'Our Services',
    aboutUs: 'About Project',
    contact: 'Contact Us',
    footerText: 'All rights reserved.',
    signature: 'Developed by @ErPyCode',
    switchLang: 'فارسی'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => translations[language][key] || key;
  const isRtl = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
