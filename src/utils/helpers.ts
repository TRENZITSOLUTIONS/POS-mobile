// src/utils/helpers.ts
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== UUID GENERATOR ====================

export const generateUUID = (): string => {
  return uuidv4();
};

// ==================== DEVICE ID ====================

const DEVICE_ID_KEY = '@device_id';

export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate new device ID using device unique ID + timestamp
      const uniqueId = await DeviceInfo.getUniqueId();
      deviceId = `${uniqueId}-${Date.now()}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    // Fallback to UUID if all else fails
    const fallbackId = generateUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
    return fallbackId;
  }
};

// ==================== DATE HELPERS ====================

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDisplayTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDisplayDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDisplayDate(d)} ${formatDisplayTime(d)}`;
};

// ==================== CURRENCY HELPERS ====================

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return `₹${amount.toFixed(2)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
};

export const parseCurrency = (amountStr: string): number => {
  // Remove currency symbols and parse
  const cleaned = amountStr.replace(/[₹$,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

// ==================== VALIDATION HELPERS ====================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Indian phone number validation (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ==================== BILL NUMBER GENERATOR ====================

export const generateBillNumber = (prefix: string = 'BILL', lastNumber?: number): string => {
  const num = lastNumber ? lastNumber + 1 : 1;
  const paddedNum = num.toString().padStart(6, '0');
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${dateStr}-${paddedNum}`;
};

// ==================== STORAGE HELPERS ====================

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ==================== ERROR HANDLING ====================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response.data.details) {
      const details = error.response.data.details;
      return Object.values(details).flat().join(' ');
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// ==================== PLATFORM HELPERS ====================

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getDeviceInfo = async () => {
  return {
    deviceId: await DeviceInfo.getUniqueId(),
    brand: await DeviceInfo.getBrand(),
    model: await DeviceInfo.getModel(),
    systemName: await DeviceInfo.getSystemName(),
    systemVersion: await DeviceInfo.getSystemVersion(),
    buildNumber: await DeviceInfo.getBuildNumber(),
    appVersion: await DeviceInfo.getVersion(),
    platform: Platform.OS,
  };
};

// ==================== ARRAY HELPERS ====================

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// ==================== RETRY LOGIC ====================

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(() => resolve(undefined), delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// ==================== DEBOUNCE ====================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default {
  generateUUID,
  getDeviceId,
  formatDate,
  formatDisplayDate,
  formatDisplayTime,
  formatDisplayDateTime,
  formatCurrency,
  parseCurrency,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  generateBillNumber,
  formatBytes,
  getErrorMessage,
  isIOS,
  isAndroid,
  getDeviceInfo,
  chunk,
  unique,
  retry,
  debounce,
};