export interface Service {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
  description?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  selectedServices: Service[];
  totalPrice: number;
  totalDuration: number;
  date: string; // ISO String for date
  timeSlot: string; // "14:00"
  createdAt: string;
}

export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface ShopSettings {
  workStartTime: string; // "10:00"
  workEndTime: string;   // "20:00"
  breakStartTime: string | null; // "13:00" or null
  breakEndTime: string | null;   // "14:00" or null
  offDays: number[]; // Array of day indexes (0=Sunday, 6=Saturday in JS? No, JS: 0=Sun, 6=Sat)
  slotInterval: number; // 30 minutes
}