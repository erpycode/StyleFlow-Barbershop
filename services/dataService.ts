import { Booking, Service, ShopSettings } from '../types';
import { INITIAL_SERVICES, DEFAULT_SETTINGS } from '../constants';

// کلیدهای ذخیره‌سازی در مرورگر
const STORAGE_KEYS = {
  SERVICES: 'curses_club_services',
  BOOKINGS: 'curses_club_bookings',
  SETTINGS: 'curses_club_settings'
};

// تابع کمکی برای خواندن از LocalStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

// تابع کمکی برای نوشتن در LocalStorage
const saveToStorage = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loginAdmin = async (username: string, password: string): Promise<boolean> => {
  if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('isAdmin', 'true');
      return true;
  }
  return false;
};

export const getServices = async (): Promise<Service[]> => {
  return getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
};

export const saveService = async (service: Service): Promise<void> => {
  const services = await getServices();
  const index = services.findIndex(s => s.id === service.id);
  
  if (index >= 0) {
    services[index] = service;
  } else {
    services.push(service);
  }
  
  saveToStorage(STORAGE_KEYS.SERVICES, services);
};

export const deleteService = async (id: string): Promise<void> => {
  const services = await getServices();
  const filtered = services.filter(s => s.id !== id);
  saveToStorage(STORAGE_KEYS.SERVICES, filtered);
};

export const getBookings = async (): Promise<Booking[]> => {
  const bookings = getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
  // مرتب‌سازی بر اساس جدیدترین
  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<string> => {
  const bookings = await getBookings();
  const id = Math.random().toString(36).substr(2, 9);
  const createdAt = new Date().toISOString();
  
  const newBooking: Booking = {
    ...booking,
    id,
    createdAt
  };
  
  bookings.push(newBooking);
  saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
  return id;
};

export const cleanupOldBookings = async (): Promise<void> => {
  // در حالت دمو نیازی به پاکسازی نیست یا می‌توان پیاده‌سازی کرد
};

export const getShopSettings = async (): Promise<ShopSettings> => {
  return getFromStorage<ShopSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveShopSettings = async (settings: ShopSettings): Promise<void> => {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};
