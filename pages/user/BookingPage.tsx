import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service, Booking, ShopSettings } from '../../types';
import { getServices, createBooking, getBookings, getShopSettings } from '../../services/dataService';
import { PERSIAN_MONTHS, DEFAULT_SETTINGS } from '../../constants';
import { Check, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Ban, Loader2 } from 'lucide-react';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for available slots & settings
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);
  const [isDayOff, setIsDayOff] = useState(false);

  useEffect(() => {
    const initData = async () => {
        setLoadingData(true);
        try {
            const [fetchedServices, fetchedBookings, fetchedSettings] = await Promise.all([
                getServices(),
                getBookings(),
                getShopSettings()
            ]);
            setServices(fetchedServices);
            setAllBookings(fetchedBookings);
            setShopSettings(fetchedSettings);
        } catch (error) {
            console.error("Error loading initial data", error);
        } finally {
            setLoadingData(false);
        }
    };
    initData();
  }, []);

  // Helper to generate time slots based on settings
  const generateTimeSlots = (settings: ShopSettings) => {
      const slots: string[] = [];
      const [startH, startM] = settings.workStartTime.split(':').map(Number);
      const [endH, endM] = settings.workEndTime.split(':').map(Number);
      
      let currentH = startH;
      let currentM = startM;

      const endTotalMinutes = endH * 60 + endM;

      while (true) {
          const currentTotalMinutes = currentH * 60 + currentM;
          
          // Stop if we reached or exceeded end time
          if (currentTotalMinutes >= endTotalMinutes) break;

          const timeString = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
          
          // Check Break Time
          let inBreak = false;
          if (settings.breakStartTime && settings.breakEndTime) {
               const [breakStartH, breakStartM] = settings.breakStartTime.split(':').map(Number);
               const [breakEndH, breakEndM] = settings.breakEndTime.split(':').map(Number);
               
               const breakStartTotal = breakStartH * 60 + breakStartM;
               const breakEndTotal = breakEndH * 60 + breakEndM;

               if (currentTotalMinutes >= breakStartTotal && currentTotalMinutes < breakEndTotal) {
                   inBreak = true;
               }
          }

          if (!inBreak) {
              slots.push(timeString);
          }

          // Increment
          currentM += settings.slotInterval;
          if (currentM >= 60) {
              currentH += Math.floor(currentM / 60);
              currentM = currentM % 60;
          }
      }
      return slots;
  };

  // Update available slots when date or bookings change
  useEffect(() => {
    if (loadingData) return;

    const dateString = selectedDate.toDateString();
    const dayOfWeek = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Check Day Off
    if (shopSettings.offDays.includes(dayOfWeek)) {
        setIsDayOff(true);
        setAvailableSlots([]);
        setSelectedTime('');
        return;
    } else {
        setIsDayOff(false);
    }

    // Generate Base Slots
    let slots = generateTimeSlots(shopSettings);

    // Filter booked slots
    const takenSlots = allBookings
        .filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.toDateString() === dateString;
        })
        .map(b => b.timeSlot);

    let free = slots.filter(slot => !takenSlots.includes(slot));
    
    // Check if selected date is today, and filter out passed times
    const now = new Date();
    if (selectedDate.toDateString() === now.toDateString()) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        free = free.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            // If hour is less than current hour, it's passed
            if (h < currentHour) return false;
            // If hour is same, check minutes
            if (h === currentHour && m <= currentMinute) return false;
            return true;
        });
    }

    setAvailableSlots(free);
    
    // Clear selected time if it's no longer available
    if (selectedTime && (!free.includes(selectedTime))) {
        setSelectedTime('');
    }
  }, [selectedDate, allBookings, selectedTime, shopSettings, loadingData]);


  const toggleService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleBooking = async () => {
    if (!customerName || !customerPhone) {
      alert('لطفا نام و شماره تماس خود را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        customerName,
        customerPhone,
        selectedServices,
        totalPrice,
        totalDuration,
        date: selectedDate.toISOString(),
        timeSlot: selectedTime
      });
      
      // Format date manually to ensure "Day Month Year" order (RTL friendly)
      const d = selectedDate;
      const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(d);
      const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(d);
      const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(d).replace(/,/g, '');
      const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(d);
      
      const formattedDate = `${weekday}، ${day} ${month} ${year}`;

      // Navigate to Success Receipt Page
      navigate('/success', {
          state: {
              customerName,
              formattedDate: formattedDate,
              timeSlot: selectedTime,
          }
      });

    } catch (e) {
      alert('خطا در ثبت نوبت');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
              <p>در حال دریافت اطلاعات...</p>
          </div>
      );
  }

  // --- Step 1: Select Services ---
  if (step === 1) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 pb-40 md:pb-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">انتخاب خدمات</h2>
          <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-medium border border-amber-500/20">مرحله ۱ از ۳</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map(service => {
            const isSelected = selectedServices.find(s => s.id === service.id);
            return (
              <div 
                key={service.id}
                onClick={() => toggleService(service)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/10' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white">{service.title}</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{service.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"><Clock size={14} /> {service.durationMinutes} دقیقه</span>
                    </div>
                  </div>
                  <div className="text-amber-500 font-bold text-lg">
                    {service.price.toLocaleString()} تومان
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Positioned at bottom-[70px] on mobile to sit above the 70px nav bar */}
        <div className="fixed bottom-[70px] md:bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 md:static md:bg-transparent md:border-0 z-40">
            <div className="max-w-4xl mx-auto flex justify-between items-center bg-slate-900 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-xl md:shadow-none border md:border-0 border-slate-800">
                <div className="text-white">
                    <span className="block text-xs text-slate-400">جمع کل</span>
                    <span className="font-bold text-2xl text-amber-500">{totalPrice.toLocaleString()} <span className="text-sm text-slate-400">تومان</span></span>
                </div>
                <button 
                    disabled={selectedServices.length === 0}
                    onClick={() => setStep(2)}
                    className="bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                    ادامه
                    <ChevronLeft size={20} />
                </button>
            </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Date & Time ---
  if (step === 2) {
      const dates = Array.from({length: 14}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return d;
      });

      return (
        <div className="space-y-8 pb-40 md:pb-24 animate-in slide-in-from-right-4">
            <button onClick={() => setStep(1)} className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                <ChevronRight size={16} /> بازگشت
            </button>
            
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">انتخاب زمان</h2>
                <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-medium border border-amber-500/20">مرحله ۲ از ۳</span>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-amber-500" /> تاریخ
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {dates.map((date) => {
                         const dayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
                         const dayNumber = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
                         const monthName = PERSIAN_MONTHS[parseInt(new Intl.DateTimeFormat('en-US-u-ca-persian', {month:'numeric'}).format(date)) - 1];

                         const isSelected = date.toDateString() === selectedDate.toDateString();

                         return (
                             <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-shrink-0 w-24 h-32 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                    isSelected 
                                    ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/20 scale-105' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                             >
                                 <span className="text-xs opacity-80">{dayName}</span>
                                 <span className="text-3xl font-bold">{dayNumber}</span>
                                 <span className="text-xs font-medium">{monthName}</span>
                             </button>
                         )
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" /> ساعت‌های موجود
                </h3>
                
                {isDayOff ? (
                    <div className="p-12 text-center border-2 border-dashed border-red-500/30 rounded-2xl text-red-400 bg-red-500/5 flex flex-col items-center gap-3">
                        <Ban size={32} />
                        <span className="font-bold text-lg">آرایشگاه در این روز تعطیل است.</span>
                        <span className="text-sm text-red-300">لطفا روز دیگری را انتخاب کنید.</span>
                    </div>
                ) : availableSlots.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 bg-slate-900/50">
                        برای این تاریخ وقت خالی وجود ندارد (یا تمام شده است). لطفا روز دیگری را انتخاب کنید.
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {availableSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-3 px-3 rounded-xl text-sm font-medium border transition-all ${
                                    selectedTime === time
                                    ? 'bg-white text-slate-900 border-white font-bold shadow-lg'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Positioned at bottom-[70px] on mobile to sit above the 70px nav bar */}
            <div className="fixed bottom-[70px] md:bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 md:static md:bg-transparent md:border-0 z-40">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <button 
                        disabled={!selectedTime}
                        onClick={() => setStep(3)}
                        className="bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-colors flex items-center gap-2"
                    >
                        تایید نهایی
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- Step 3: Confirmation ---
  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-4">
        <button onClick={() => setStep(2)} className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
            <ChevronRight size={16} /> بازگشت
        </button>

        <h2 className="text-2xl font-bold text-white">اطلاعات شما</h2>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">نام و نام خانوادگی</label>
                <div className="relative">
                    <User className="absolute right-3 top-3.5 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        placeholder="مثال: علی محمدی"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">شماره موبایل</label>
                <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="0912..."
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                />
            </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
             <h3 className="font-bold text-white mb-2">خلاصه رزرو</h3>
             <div className="flex justify-between text-sm">
                 <span className="text-slate-400">تاریخ:</span>
                 <span className="font-medium text-slate-200">{new Intl.DateTimeFormat('fa-IR').format(selectedDate)}</span>
             </div>
             <div className="flex justify-between text-sm">
                 <span className="text-slate-400">ساعت:</span>
                 <span className="font-medium text-slate-200">{selectedTime}</span>
             </div>
             <div className="flex justify-between text-sm">
                 <span className="text-slate-400">مدت زمان:</span>
                 <span className="font-medium text-slate-200">{totalDuration} دقیقه</span>
             </div>
             <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                 <span className="font-bold text-white">مبلغ قابل پرداخت:</span>
                 <span className="font-bold text-xl text-amber-500">{totalPrice.toLocaleString()} تومان</span>
             </div>
        </div>

        <button 
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-200 transition-all flex justify-center items-center gap-2"
        >
            {loading ? 'در حال ثبت...' : 'ثبت قطعی نوبت'}
        </button>
    </div>
  );
};

export default BookingPage;