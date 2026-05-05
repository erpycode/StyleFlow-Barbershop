import { Service, ShopSettings } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: '1', title: 'اصلاح موی سر', price: 150000, durationMinutes: 30, description: 'مدل‌های کلاسیک و مدرن' },
  { id: '2', title: 'اصلاح صورت', price: 80000, durationMinutes: 20, description: 'با ماشین یا تیغ' },
  { id: '3', title: 'پکیج داماد', price: 1500000, durationMinutes: 120, description: 'گریم، پاکسازی و اصلاح کامل' },
  { id: '4', title: 'پاکسازی پوست', price: 300000, durationMinutes: 45, description: 'ماسک سیاه و بخور گرم' },
];

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const DEFAULT_SETTINGS: ShopSettings = {
  workStartTime: '10:00',
  workEndTime: '20:00',
  breakStartTime: null,
  breakEndTime: null,
  offDays: [5], // Friday (In JS getDay(): 5 is Friday)
  slotInterval: 30
};