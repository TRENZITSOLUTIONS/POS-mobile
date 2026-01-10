// src/utils/billNumbering.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BillNumberingSettings {
  prefix: string;
  startingNumber: string;
  includeDate: boolean;
  currentNumber?: number;
}

/**
 * Get the next bill number based on current settings
 * Automatically increments the counter
 */
export const getNextBillNumber = async (): Promise<string> => {
  try {
    const settingsJson = await AsyncStorage.getItem('bill_numbering');
    
    let settings: BillNumberingSettings;
    
    if (settingsJson) {
      settings = JSON.parse(settingsJson);
    } else {
      // Default settings if none exist
      settings = {
        prefix: 'INV-',
        startingNumber: '1001',
        includeDate: true,
        currentNumber: 1001,
      };
    }

    // Get current number (use startingNumber if currentNumber doesn't exist)
    const currentNumber = settings.currentNumber || parseInt(settings.startingNumber, 10);
    
    // Generate bill number
    const billNumber = generateBillNumber(
      settings.prefix,
      currentNumber,
      settings.includeDate
    );
    
    // Increment counter for next time
    settings.currentNumber = currentNumber + 1;
    await AsyncStorage.setItem('bill_numbering', JSON.stringify(settings));
    
    return billNumber;
  } catch (error) {
    console.error('Failed to get next bill number:', error);
    // Return fallback bill number
    return `INV-${Date.now()}`;
  }
};

/**
 * Generate a bill number without incrementing the counter (for preview)
 */
export const previewBillNumber = async (): Promise<string> => {
  try {
    const settingsJson = await AsyncStorage.getItem('bill_numbering');
    
    let settings: BillNumberingSettings;
    
    if (settingsJson) {
      settings = JSON.parse(settingsJson);
    } else {
      settings = {
        prefix: 'INV-',
        startingNumber: '1001',
        includeDate: true,
        currentNumber: 1001,
      };
    }

    const currentNumber = settings.currentNumber || parseInt(settings.startingNumber, 10);
    
    return generateBillNumber(
      settings.prefix,
      currentNumber,
      settings.includeDate
    );
  } catch (error) {
    console.error('Failed to preview bill number:', error);
    return 'INV-1001';
  }
};

/**
 * Helper function to generate bill number string
 */
const generateBillNumber = (
  prefix: string,
  number: number,
  includeDate: boolean
): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  if (includeDate) {
    return `${prefix}${dateString}-${number}`;
  } else {
    return `${prefix}${number}`;
  }
};

/**
 * Reset the bill numbering counter (use with caution!)
 */
export const resetBillNumbering = async (): Promise<void> => {
  try {
    const settingsJson = await AsyncStorage.getItem('bill_numbering');
    
    if (settingsJson) {
      const settings: BillNumberingSettings = JSON.parse(settingsJson);
      settings.currentNumber = parseInt(settings.startingNumber, 10);
      await AsyncStorage.setItem('bill_numbering', JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Failed to reset bill numbering:', error);
    throw error;
  }
};

/**
 * Get current bill numbering settings
 */
export const getBillNumberingSettings = async (): Promise<BillNumberingSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem('bill_numbering');
    
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    
    // Return defaults
    return {
      prefix: 'INV-',
      startingNumber: '1001',
      includeDate: true,
      currentNumber: 1001,
    };
  } catch (error) {
    console.error('Failed to get bill numbering settings:', error);
    return {
      prefix: 'INV-',
      startingNumber: '1001',
      includeDate: true,
      currentNumber: 1001,
    };
  }
};