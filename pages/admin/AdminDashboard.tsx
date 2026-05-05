import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Booking, Service, ShopSettings } from '../../types';
import { getBookings, getServices, saveService, deleteService, getShopSettings, saveShopSettings, cleanupOldBookings } from '../../services/dataService';
import { Download, Plus, Trash2, Edit2, Clock, CalendarCheck, Printer, Filter, Settings, Save, CheckCircle2, XCircle, X, RefreshCw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../constants';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'settings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Notification State
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('isAdmin');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  // Auto-refresh every 5 minutes (300000 ms) if enabled
  useEffect(() => {
      let intervalId: any;
      if (autoRefresh) {
          intervalId = setInterval(() => {
              loadData(true); // true = silent refresh
          }, 300000);
      }
      return () => {
          if (intervalId) clearInterval(intervalId);
      };
  }, [autoRefresh]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
        // First cleanup old bookings (yesterday and before)
        await cleanupOldBookings();

        const b = await getBookings();
        const s = await getServices();
        const config = await getShopSettings();
        
        // Sort bookings: Date (Day) Ascending, then Time Ascending
        const sortedBookings = b.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Normalize to YYYYMMDD to compare calendar days only
            const dayA = dateA.getFullYear() * 10000 + dateA.getMonth() * 100 + dateA.getDate();
            const dayB = dateB.getFullYear() * 10000 + dateB.getMonth() * 100 + dateB.getDate();
            
            if (dayA !== dayB) return dayA - dayB; // Ascending: Earliest date first
            return a.timeSlot.localeCompare(b.timeSlot); // Earliest time first within same day
        });
        
        setBookings(sortedBookings);
        setServices(s);
        setSettings(config);
    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        if (!silent) setIsRefreshing(false);
    }
  };

  // Helper to format date strictly as "Day Month Year"
  const getFormattedDateParts = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(d);
      const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(d);
      const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(d).replace('،', ''); // remove grouping comma if present
      const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(d);
      
      return {
          day, month, year, weekday,
          full: `${day} ${month} ${year}` // e.g. "13 Azar 1404"
      };
  };

  const exportExcel = () => {
    const dataToExport = getDisplayedBookings();
    const data = dataToExport.map(b => {
      const { full } = getFormattedDateParts(b.date);
      return {
        'نام مشتری': b.customerName,
        'شماره تماس': b.customerPhone,
        'خدمات انتخاب شده': b.selectedServices.map(s => s.title).join(', '),
        'تاریخ': full,
        'ساعت': b.timeSlot,
        'قیمت کل': b.totalPrice,
        'زمان ثبت': new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(b.createdAt))
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, showTodayOnly ? "ArsesClub_Today.xlsx" : "ArsesClub_All_Bookings.xlsx");
  };

  // Generic Print Function (Handles both "Print All" and "Print Day")
  const handlePrint = (bookingsToPrint: Booking[], title: string) => {
      const grouped = groupBookingsByDate(bookingsToPrint);
      // Sort dates ascending
      const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const [yA, mA, dA] = a.split('-').map(Number);
        const [yB, mB, dB] = b.split('-').map(Number);
        const dateA = new Date(yA, mA, dA).getTime();
        const dateB = new Date(yB, mB, dB).getTime();
        return dateA - dateB; 
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html dir="rtl">
              <head>
                  <title>چاپ نوبت‌ها - ${title}</title>
                  <style>
                      body { font-family: 'Tahoma', 'Vazirmatn', sans-serif; padding: 20px; direction: rtl; color: #000; }
                      h1 { text-align: center; margin-bottom: 10px; font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                      h2 { font-size: 18px; margin-top: 30px; margin-bottom: 10px; background-color: #eee; padding: 10px; border-radius: 5px; }
                      .meta { text-align: center; margin-bottom: 30px; color: #555; font-size: 14px; }
                      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                      th, td { border: 1px solid #ccc; padding: 8px; text-align: center; font-size: 13px; }
                      th { background-color: #f0f0f0; font-weight: bold; }
                      .total-row { font-weight: bold; background-color: #fafafa; }
                      @media print {
                          body { padding: 0; }
                          button { display: none; }
                          h2 { break-after: avoid; }
                          table { break-inside: auto; }
                          tr { break-inside: avoid; break-after: auto; }
                      }
                  </style>
              </head>
              <body>
                  <h1>آرسس کلاب</h1>
                  <div class="meta">گزارش نوبت‌دهی: ${title}</div>
                  
                  ${sortedKeys.map(dateKey => {
                      const dayBookings = grouped[dateKey];
                      dayBookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
                      
                      const sampleDate = dayBookings[0].date;
                      const { full, weekday } = getFormattedDateParts(sampleDate);

                      return `
                          <div class="date-group">
                              <h2>${weekday}، ${full}</h2>
                              <table>
                                  <thead>
                                      <tr>
                                          <th width="10%">ساعت</th>
                                          <th width="25%">نام مشتری</th>
                                          <th width="20%">شماره تماس</th>
                                          <th width="30%">خدمات</th>
                                          <th width="15%">مبلغ (تومان)</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      ${dayBookings.map(b => `
                                          <tr>
                                              <td><b>${b.timeSlot}</b></td>
                                              <td>${b.customerName}</td>
                                              <td>${b.customerPhone}</td>
                                              <td>${b.selectedServices.map(s => s.title).join('، ')}</td>
                                              <td>${b.totalPrice.toLocaleString()}</td>
                                          </tr>
                                      `).join('')}
                                  </tbody>
                              </table>
                          </div>
                      `;
                  }).join('')}

                  <script>
                      window.onload = function() { window.print(); }
                  </script>
              </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  const handleSaveService = async () => {
    if (!editingService?.title || !editingService?.price) return;
    
    const newService: Service = {
      id: editingService.id || Math.random().toString(36).substr(2, 9),
      title: editingService.title,
      price: Number(editingService.price),
      durationMinutes: Number(editingService.durationMinutes) || 30,
      description: editingService.description || ''
    };

    await saveService(newService);
    setEditingService(null);
    loadData();
    setNotification({ type: 'success', message: 'خدمات با موفقیت به‌روزرسانی شد.' });
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('آیا از حذف این خدمت اطمینان دارید؟')) {
      await deleteService(id);
      loadData();
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await saveShopSettings(settings);
      setNotification({ type: 'success', message: 'تنظیمات با موفقیت ذخیره شد.' });
    } catch (e) {
      setNotification({ type: 'error', message: 'خطا در ذخیره تنظیمات. لطفا اتصال اینترنت را بررسی کنید.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleDayOff = (dayIndex: number) => {
      const current = settings.offDays;
      if (current.includes(dayIndex)) {
          setSettings({...settings, offDays: current.filter(d => d !== dayIndex)});
      } else {
          setSettings({...settings, offDays: [...current, dayIndex]});
      }
  };

  const logout = () => {
      sessionStorage.removeItem('isAdmin');
      navigate('/admin/login');
  }

  const getDisplayedBookings = () => {
      if (showTodayOnly) {
          const today = new Date();
          const todayVal = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
          
          return bookings
            .filter(b => {
                const bd = new Date(b.date);
                const bdVal = bd.getFullYear() * 10000 + bd.getMonth() * 100 + bd.getDate();
                return bdVal === todayVal;
            })
            .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      }
      return bookings;
  };

  // Group bookings by date for the main view
  const groupBookingsByDate = (bookingList: Booking[]) => {
      const groups: { [key: string]: Booking[] } = {};
      bookingList.forEach(b => {
          // Use YYYY-MM-DD as key to group by calendar day
          const d = new Date(b.date);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(b);
      });
      return groups;
  };

  const displayedBookings = getDisplayedBookings();
  const groupedBookings = groupBookingsByDate(displayedBookings);
  
  // Sort date keys Ascending (Earliest date first)
  const sortedDateKeys = Object.keys(groupedBookings).sort((a, b) => {
      const [yA, mA, dA] = a.split('-').map(Number);
      const [yB, mB, dB] = b.split('-').map(Number);
      const dateA = new Date(yA, mA, dA).getTime();
      const dateB = new Date(yB, mB, dB).getTime();
      return dateA - dateB; // Ascending
  });

  const weekDays = [
      { id: 6, label: 'شنبه' },
      { id: 0, label: 'یکشنبه' },
      { id: 1, label: 'دوشنبه' },
      { id: 2, label: 'سه‌شنبه' },
      { id: 3, label: 'چهارشنبه' },
      { id: 4, label: 'پنج‌شنبه' },
      { id: 5, label: 'جمعه' },
  ];

  return (
    <div className="space-y-6 pb-20 relative" dir="rtl">
      {/* Notification Popup */}
      {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 relative transform animate-in zoom-in-95 duration-200">
                  <button 
                      onClick={() => setNotification(null)}
                      className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {notification.type === 'success' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                          {notification.type === 'success' ? 'موفقیت' : 'خطا'}
                      </h3>
                      <p className="text-slate-400">
                          {notification.message}
                      </p>
                      
                      <button 
                          onClick={() => setNotification(null)}
                          className={`mt-2 w-full py-3 rounded-xl font-bold text-white transition-all ${
                              notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                          }`}
                      >
                          متوجه شدم
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-white">داشبورد مدیریت آرسس</h2>
        <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm font-medium border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">خروج از حساب</button>
      </div>

      <div className="flex gap-4 border-b border-slate-800 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap relative ${activeTab === 'bookings' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          لیست نوبت‌ها
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap relative ${activeTab === 'services' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          مدیریت خدمات
          {activeTab === 'services' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap relative ${activeTab === 'settings' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          تنظیمات
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>}
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Action Bar */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                  <button 
                      onClick={() => setShowTodayOnly(!showTodayOnly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          showTodayOnly 
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20 ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                      {showTodayOnly ? <CalendarCheck size={18} /> : <Filter size={18} />}
                      {showTodayOnly ? 'نمایش همه نوبت‌ها' : 'فقط نوبت‌های امروز'}
                  </button>

                  <button 
                    onClick={() => loadData(false)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>بروزرسانی</span>
                  </button>

                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        autoRefresh
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                      <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                      {autoRefresh ? 'رفرش خودکار فعال' : 'رفرش خودکار غیرفعال'}
                  </button>
                  
                  {showTodayOnly && (
                      <span className="text-sm text-amber-500 font-medium animate-pulse ml-2">
                          {displayedBookings.length} نوبت امروز
                      </span>
                  )}
              </div>

              <div className="flex gap-2">
                  <button 
                    onClick={() => handlePrint(bookings, 'همه نوبت‌ها')}
                    className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Printer size={18} />
                    چاپ همه نوبت‌ها
                  </button>
                  <button 
                    onClick={exportExcel}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-900/20"
                  >
                    <Download size={18} />
                    خروجی اکسل
                  </button>
              </div>
          </div>
          
          <div className="space-y-8">
            {sortedDateKeys.length === 0 ? (
                 <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800">
                    <CalendarCheck size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 text-lg">نوبتی برای نمایش وجود ندارد.</p>
                 </div>
            ) : (
                sortedDateKeys.map(dateKey => {
                    const dayBookings = groupedBookings[dateKey];
                    // Sort bookings within the day by time
                    dayBookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
                    
                    const sampleDate = dayBookings[0].date;
                    const { full, weekday } = getFormattedDateParts(sampleDate);

                    return (
                        <div key={dateKey} className="bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-800">
                            {/* Date Header */}
                            <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
                                        <CalendarCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            <span>{weekday}،</span>
                                            <span className="text-amber-500">{full}</span>
                                        </h3>
                                        <span className="text-xs text-slate-500">{dayBookings.length} نوبت ثبت شده</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handlePrint(dayBookings, `${weekday} ${full}`)}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                    <Printer size={14} />
                                    چاپ نوبت‌ها
                                </button>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="p-4 w-24">ساعت</th>
                                    <th className="p-4">مشتری</th>
                                    <th className="p-4">خدمات</th>
                                    <th className="p-4">مبلغ</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                {dayBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="bg-slate-800 text-center py-1 px-2 rounded text-amber-500 font-bold border border-slate-700">
                                            {booking.timeSlot}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{booking.customerName}</div>
                                        <div className="text-slate-500 text-xs font-mono mt-1">{booking.customerPhone}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <div className="flex flex-wrap gap-1">
                                            {booking.selectedServices.map((s, idx) => (
                                                <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">
                                                    {s.title}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-white">
                                        {booking.totalPrice.toLocaleString()}
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6 animate-in fade-in">
            {!editingService ? (
                 <button 
                    onClick={() => setEditingService({})}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                 >
                    <Plus size={18} /> افزودن خدمت جدید
                 </button>
            ) : null}

           {editingService && (
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-4">
                   <h3 className="font-bold text-white">{editingService.id ? 'ویرایش خدمت' : 'افزودن خدمت جدید'}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input 
                          type="text" 
                          placeholder="عنوان خدمت"
                          value={editingService.title || ''}
                          onChange={e => setEditingService({...editingService, title: e.target.value})}
                          className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                       />
                       <input 
                          type="number" 
                          placeholder="قیمت (تومان)"
                          value={editingService.price || ''}
                          onChange={e => setEditingService({...editingService, price: Number(e.target.value)})}
                          className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                       />
                       <input 
                          type="number" 
                          placeholder="مدت زمان (دقیقه)"
                          value={editingService.durationMinutes || ''}
                          onChange={e => setEditingService({...editingService, durationMinutes: Number(e.target.value)})}
                          className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                       />
                        <input 
                          type="text" 
                          placeholder="توضیحات کوتاه"
                          value={editingService.description || ''}
                          onChange={e => setEditingService({...editingService, description: e.target.value})}
                          className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                       />
                   </div>
                   <div className="flex justify-end gap-3">
                       <button onClick={() => setEditingService(null)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg">انصراف</button>
                       <button onClick={handleSaveService} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">ذخیره</button>
                   </div>
               </div>
           )}

           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {services.map(service => (
                   <div key={service.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex justify-between items-start group hover:border-slate-700 transition-all">
                       <div>
                           <h4 className="font-bold text-white text-lg">{service.title}</h4>
                           <p className="text-sm text-slate-400 mt-2">{service.price.toLocaleString()} تومان</p>
                           <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> {service.durationMinutes} دقیقه</p>
                       </div>
                       <div className="flex gap-2">
                           <button onClick={() => setEditingService(service)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors">
                               <Edit2 size={16} />
                           </button>
                           <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                               <Trash2 size={16} />
                           </button>
                       </div>
                   </div>
               ))}
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                   <Settings className="text-amber-500" size={28} />
                   <h2 className="text-2xl font-bold text-white">تنظیمات نوبت‌دهی</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Working Hours */}
                  <div className="space-y-4">
                      <h3 className="font-bold text-white text-lg">ساعات کاری</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">ساعت شروع</label>
                              <select 
                                value={settings.workStartTime}
                                onChange={(e) => setSettings({...settings, workStartTime: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
                              >
                                  {Array.from({length: 24}, (_, i) => {
                                      const t = `${i.toString().padStart(2, '0')}:00`;
                                      return <option key={t} value={t}>{t}</option>
                                  })}
                              </select>
                          </div>
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">ساعت پایان</label>
                              <select 
                                value={settings.workEndTime}
                                onChange={(e) => setSettings({...settings, workEndTime: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
                              >
                                  {Array.from({length: 24}, (_, i) => {
                                      const t = `${i.toString().padStart(2, '0')}:00`;
                                      return <option key={t} value={t}>{t}</option>
                                  })}
                              </select>
                          </div>
                      </div>
                  </div>

                  {/* Break Time */}
                  <div className="space-y-4">
                      <h3 className="font-bold text-white text-lg">زمان استراحت (ناهار)</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">شروع استراحت</label>
                              <select 
                                value={settings.breakStartTime || ''}
                                onChange={(e) => setSettings({...settings, breakStartTime: e.target.value || null})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
                              >
                                  <option value="">بدون استراحت</option>
                                  {Array.from({length: 24}, (_, i) => {
                                      const t = `${i.toString().padStart(2, '0')}:00`;
                                      return <option key={t} value={t}>{t}</option>
                                  })}
                              </select>
                          </div>
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">پایان استراحت</label>
                              <select 
                                value={settings.breakEndTime || ''}
                                onChange={(e) => setSettings({...settings, breakEndTime: e.target.value || null})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
                              >
                                  <option value="">بدون استراحت</option>
                                  {Array.from({length: 24}, (_, i) => {
                                      const t = `${i.toString().padStart(2, '0')}:00`;
                                      return <option key={t} value={t}>{t}</option>
                                  })}
                              </select>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Days Off */}
              <div className="mt-8">
                  <h3 className="font-bold text-white text-lg mb-4">روزهای تعطیل</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {weekDays.map(day => (
                          <div 
                            key={day.id}
                            onClick={() => toggleDayOff(day.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                settings.offDays.includes(day.id)
                                ? 'bg-red-500/10 border-red-500 text-red-400'
                                : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                  settings.offDays.includes(day.id) ? 'bg-red-500 border-red-500' : 'border-slate-600'
                              }`}>
                                  {settings.offDays.includes(day.id) && <CheckIcon />}
                              </div>
                              <span>{day.label}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                      {savingSettings ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                      ذخیره تغییرات
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default AdminDashboard;