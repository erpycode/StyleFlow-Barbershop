import React from 'react';
import { Calendar, Lock, Home, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../services/LanguageContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { language, setLanguage, t, isRtl } = useLanguage();

  const isCurrent = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'fa' ? 'en' : 'fa');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const active = isCurrent(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          active 
            ? 'bg-amber-600 text-white font-bold shadow-lg shadow-amber-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const active = isCurrent(to);
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
          active 
            ? 'text-amber-500' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""} />
        <span className="text-[10px] mt-1 font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row ${isRtl ? 'font-vazir' : 'font-sans'}`}>
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 shadow-sm p-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">
          <span>{t('heroTitle')}</span>
        </h1>
        <button 
          onClick={toggleLanguage}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 flex items-center gap-2 text-xs"
        >
          <Globe size={16} />
          {t('switchLang')}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 bg-slate-900 ${isRtl ? 'border-l' : 'border-r'} border-slate-800 min-h-screen sticky top-0`}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-white">
            <span>{t('heroTitle')}</span>
          </h1>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <NavItem to="/" icon={Home} label={language === 'fa' ? 'صفحه اصلی' : 'Home'} />
          <NavItem to="/booking" icon={Calendar} label={language === 'fa' ? 'رزرو وقت' : 'Booking'} />
          <NavItem to="/about" icon={Globe} label={t('aboutUs')} />
          <div className="pt-4 mt-4 border-t border-slate-800">
             <p className="px-4 text-xs text-slate-500 mb-2">{language === 'fa' ? 'مدیریت' : 'Admin'}</p>
             <NavItem to="/admin" icon={Lock} label={language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'} />
          </div>
        </nav>

        <div className="p-4 space-y-4">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Globe size={18} />
            {t('switchLang')}
          </button>
          
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {t('signature')}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-950 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-16 left-4 right-4 z-50 pointer-events-none text-center">
         <span className="inline-block px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-[8px] text-slate-500 font-bold border border-slate-800 pointer-events-auto">
            {t('signature')}
         </span>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 h-[70px] pb-safe">
        <div className="flex justify-around items-center h-full px-2">
          <MobileNavItem to="/" icon={Home} label={language === 'fa' ? 'خانه' : 'Home'} />
          <MobileNavItem to="/booking" icon={Calendar} label={language === 'fa' ? 'رزرو' : 'Book'} />
          <MobileNavItem to="/about" icon={Globe} label={language === 'fa' ? 'درباره' : 'About'} />
          <MobileNavItem to="/admin" icon={Lock} label={language === 'fa' ? 'مدیریت' : 'Admin'} />
        </div>
      </nav>
    </div>
  );
};

export default Layout;