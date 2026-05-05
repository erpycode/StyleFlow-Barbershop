import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Calendar, Clock, Home, Navigation, Copy } from 'lucide-react';
import { Booking } from '../../types';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as Partial<Booking> & { formattedDate: string };

  // If accessed directly without data, go home
  useEffect(() => {
    if (!bookingData) {
      navigate('/');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const address = "تهران، خیابان انقلاب، خیابان سپاه، پلاک ۴۰";
  const mapLink = "https://www.google.com/maps/search/?api=1&query=Tehran+Enghelab+Street+Sepah+Street";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-500">
      
      <div className="bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
        {/* Top Decoration */}
        <div className="h-32 bg-amber-600 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl z-10 translate-y-10">
                <CheckCircle2 className="text-green-500 w-10 h-10" />
            </div>
        </div>

        <div className="pt-14 pb-8 px-8 text-center space-y-6">
            <div>
                <h2 className="text-2xl font-black text-white">نوبت شما رزرو شد!</h2>
                <p className="text-slate-400 text-sm mt-2">رسید نوبت آرایشگاه آرسس کلاب</p>
            </div>

            {/* Ticket Details */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-slate-500 text-sm">مشتری</span>
                    <span className="text-white font-bold">{bookingData.customerName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-slate-500 text-sm flex items-center gap-1"><Calendar size={14}/> تاریخ</span>
                    <span className="text-amber-500 font-bold">{bookingData.formattedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={14}/> ساعت حضور</span>
                    <span className="text-white font-bold text-xl">{bookingData.timeSlot}</span>
                </div>
            </div>

            {/* Address Section */}
            <div className="space-y-3">
                <div className="flex items-start gap-3 text-right bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <MapPin className="text-red-500 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">آدرس سالن:</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{address}</p>
                    </div>
                </div>

                {/* Map Embed (Static Iframe representation) */}
                <div className="rounded-xl overflow-hidden h-40 border border-slate-700 relative group">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src="https://maps.google.com/maps?q=Tehran+Enghelab+Street+Sepah+Street&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                    ></iframe>
                    <a 
                        href={mapLink} 
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                            <Navigation size={16} /> باز کردن نقشه
                        </span>
                    </a>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <a 
                    href={mapLink} 
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Navigation size={18} />
                    مسیریابی
                </a>
                <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Home size={18} />
                    صفحه اصلی
                </button>
            </div>
        </div>

        {/* Decorative Ticket Circles */}
        <div className="absolute top-[128px] -left-4 w-8 h-8 bg-slate-950 rounded-full"></div>
        <div className="absolute top-[128px] -right-4 w-8 h-8 bg-slate-950 rounded-full"></div>
        <div className="absolute top-[142px] left-4 right-4 border-t-2 border-dashed border-slate-800/50"></div>
      </div>
    </div>
  );
};

export default SuccessPage;
