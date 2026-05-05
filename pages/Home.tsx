import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShieldCheck, Scissors } from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-12 text-center py-12">
      <div className="space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-4 border border-slate-800 shadow-xl">
            <Scissors className="text-amber-500 w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Link to="/booking" className="group relative overflow-hidden bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 hover:border-amber-500/50 hover:shadow-amber-900/10 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-5 bg-slate-800 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
              <Calendar size={36} />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {language === 'fa' ? 'رزرو نوبت آنلاین' : 'Online Booking'}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'fa' ? 'مشاهده وقت‌های خالی و رزرو سریع' : 'View availability and book fast'}
                </p>
            </div>
          </div>
        </Link>

        <Link to="/admin" className="group relative overflow-hidden bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 hover:border-blue-500/50 hover:shadow-blue-900/10 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-5 bg-slate-800 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {t('adminPanel')}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === 'fa' ? 'مدیریت نوبت‌ها و خدمات سالن' : 'Manage appointments and services'}
                </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;