// src/services/sync.ts
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDateTime } from '../utils/helpers';
import { getDatabase } from '../database/schema';
import API from './api';
import { getUserData } from './auth';

export interface SyncOperation {
  operation_type: 'create' | 'update' | 'delete';
  entity_type: 'category' | 'item' | 'bill';
  entity_id: string;
  data: any;
  timestamp: string;
  retry_count?: number;
}

// Helper to execute SQL
const executeSql = (sql: string, params: any[] = []): any[] => {
  const db = getDatabase();
  const result = db.execute(sql, params);
  return result.rows?._array || [];
};

// ==================== NETWORK STATUS ====================

let isOnline = true;

export const initNetworkListener = () => {
  NetInfo.addEventListener(state => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;
    
    console.log(`Network status: ${isOnline ? 'Online' : 'Offline'}`);
    
    if (wasOffline && isOnline) {
      console.log('Back online - triggering sync');
      setTimeout(() => syncAll(), 1000);
    }
  });
};

export const getNetworkStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

// ==================== SYNC HISTORY ====================

/**
 * Save sync operation to history for BackupDetailsScreen
 */
const saveSyncToHistory = async (
  categoriesSynced: number,
  itemsSynced: number,
  billsSynced: number
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const formattedDate = formatDisplayDateTime(now);
    
    // Create new history entry
    const newEntry = {
      id: now, // Use timestamp as ID
      date: formattedDate,
      timestamp: now,
      items: [
        { name: 'Categories', count: categoriesSynced },
        { name: 'Items', count: itemsSynced },
        { name: 'Bills', count: billsSynced },
      ].filter(item => item.count > 0), // Only include items that were actually synced
    };
    
    // Load existing history
    const historyJson = await AsyncStorage.getItem('sync_history');
    let history = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new entry to beginning
    history.unshift(newEntry);
    
    // Keep only last 20 entries
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    // Save updated history
    await AsyncStorage.setItem('sync_history', JSON.stringify(history));
    
    console.log('Sync history saved successfully');
  } catch (error) {
    console.error('Failed to save sync history:', error);
    // Don't throw - this is not critical
  }
};

// ==================== QUEUE OPERATIONS ====================

export const queueOperation = async (operation: SyncOperation): Promise<void> => {
  const now = new Date().toISOString();
  
  try {
    executeSql(
      `INSERT INTO sync_queue 
       (operation_type, entity_type, entity_id, data, timestamp, retry_count, synced, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.operation_type,
        operation.entity_type,
        operation.entity_id,
        JSON.stringify(operation.data),
        operation.timestamp,
        0,
        0,
        now,
      ]
    );
    
    console.log(`Queued ${operation.operation_type} operation for ${operation.entity_type}:${operation.entity_id}`);
    
    if (await getNetworkStatus()) {
      setTimeout(() => syncAll(), 500);
    }
  } catch (error) {
    console.error('Failed to queue operation:', error);
    throw error;
  }
};

export const getPendingOperations = async (): Promise<any[]> => {
  try {
    return executeSql(
      'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC'
    );
  } catch (error) {
    console.error('Failed to get pending operations:', error);
    return [];
  }
};

export const markOperationSynced = async (operationId: number): Promise<void> => {
  const now = new Date().toISOString();
  
  try {
    executeSql(
      'UPDATE sync_queue SET synced = 1, synced_at = ? WHERE id = ?',
      [now, operationId]
    );
  } catch (error) {
    console.error('Failed to mark operation as synced:', error);
  }
};

export const updateRetryCount = async (operationId: number, error: string): Promise<void> => {
  try {
    executeSql(
      'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
      [error, operationId]
    );
  } catch (error) {
    console.error('Failed to update retry count:', error);
  }
};

// ==================== SYNC FUNCTIONS ====================

export const syncCategories = async (): Promise<{ success: boolean; synced: number }> => {
  try {
    const operations = executeSql(
      `SELECT * FROM sync_queue 
       WHERE entity_type = 'category' AND synced = 0 
       ORDER BY created_at ASC`
    );
    
    if (operations.length === 0) {
      return { success: true, synced: 0 };
    }
    
    console.log(`Syncing ${operations.length} category operations...`);
    
    const syncPayload = operations.map(op => ({
      operation: op.operation_type,
      data: op.operation_type !== 'delete' ? JSON.parse(op.data) : undefined,
      id: op.operation_type === 'delete' ? op.entity_id : undefined,
      timestamp: op.timestamp,
    }));
    
    const response = await API.categories.sync(syncPayload);
    
    console.log(`Categories synced: ${response.synced} operations`);
    
    for (const op of operations) {
      await markOperationSynced(op.id);
    }
    
    if (response.categories && response.categories.length > 0) {
      for (const category of response.categories) {
        executeSql(
          `UPDATE categories 
           SET is_synced = 1, server_updated_at = ?, updated_at = ?
           WHERE id = ?`,
          [category.updated_at, new Date().toISOString(), category.id]
        );
      }
    }
    
    return { success: true, synced: operations.length };
  } catch (error) {
    console.error('Category sync failed:', error);
    return { success: false, synced: 0 };
  }
};

export const syncItems = async (): Promise<{ success: boolean; synced: number }> => {
  try {
    const operations = executeSql(
      `SELECT * FROM sync_queue 
       WHERE entity_type = 'item' AND synced = 0 
       ORDER BY created_at ASC`
    );
    
    if (operations.length === 0) {
      return { success: true, synced: 0 };
    }
    
    console.log(`Syncing ${operations.length} item operations...`);
    
    const syncPayload = operations.map(op => ({
      operation: op.operation_type,
      data: op.operation_type !== 'delete' ? JSON.parse(op.data) : undefined,
      id: op.operation_type === 'delete' ? op.entity_id : undefined,
      timestamp: op.timestamp,
    }));
    
    const response = await API.items.sync(syncPayload);
    
    console.log(`Items synced: ${response.synced} operations`);
    
    for (const op of operations) {
      await markOperationSynced(op.id);
    }
    
    if (response.items && response.items.length > 0) {
      for (const item of response.items) {
        executeSql(
          `UPDATE items 
           SET is_synced = 1, server_updated_at = ?, image_url = ?, updated_at = ?
           WHERE id = ?`,
          [item.last_updated, item.image_url, new Date().toISOString(), item.id]
        );
      }
    }
    
    return { success: true, synced: operations.length };
  } catch (error) {
    console.error('Item sync failed:', error);
    return { success: false, synced: 0 };
  }
};

export const syncBills = async (): Promise<{ success: boolean; synced: number }> => {
  try {
    const userData = await getUserData();
    
    if (!userData) {
      console.log('No user data - skipping bill sync');
      return { success: false, synced: 0 };
    }
    
    const bills = executeSql(
      'SELECT * FROM bills WHERE is_synced = 0 ORDER BY created_at ASC LIMIT 50'
    );
    
    if (bills.length === 0) {
      return { success: true, synced: 0 };
    }
    
    console.log(`Syncing ${bills.length} bills...`);
    
    const billPayload = bills.map(bill => ({
      bill_data: {
        bill_id: bill.id,
        bill_number: bill.bill_number,
        items: JSON.parse(bill.items),
        subtotal: bill.subtotal,
        tax_amount: bill.tax_amount,
        discount_amount: bill.discount_amount,
        total_amount: bill.total_amount,
        payment_method: bill.payment_method,
        customer_name: bill.customer_name,
        customer_phone: bill.customer_phone,
        notes: bill.notes,
        timestamp: bill.created_at,
      },
      device_id: bill.device_id,
    }));
    
    const response = await API.bills.sync(billPayload);
    
    console.log(`Bills synced: ${response.synced} bills`);
    
    const billIds = bills.map(b => b.id);
    const placeholders = billIds.map(() => '?').join(',');
    executeSql(
      `UPDATE bills SET is_synced = 1 WHERE id IN (${placeholders})`,
      billIds
    );
    
    return { success: true, synced: bills.length };
  } catch (error) {
    console.error('Bill sync failed:', error);
    return { success: false, synced: 0 };
  }
};

export const syncAll = async (): Promise<{
  success: boolean;
  categoriesSynced: number;
  itemsSynced: number;
  billsSynced: number;
}> => {
  console.log('=== Starting full sync ===');
  
  const online = await getNetworkStatus();
  if (!online) {
    console.log('Offline - skipping sync');
    return { success: false, categoriesSynced: 0, itemsSynced: 0, billsSynced: 0 };
  }
  
  const categoriesResult = await syncCategories();
  const itemsResult = await syncItems();
  const billsResult = await syncBills();
  
  const success = categoriesResult.success && itemsResult.success && billsResult.success;
  
  console.log('=== Sync complete ===');
  console.log(`Categories: ${categoriesResult.synced}, Items: ${itemsResult.synced}, Bills: ${billsResult.synced}`);
  
  // Save to history if any items were synced
  if (success && (categoriesResult.synced > 0 || itemsResult.synced > 0 || billsResult.synced > 0)) {
    await saveSyncToHistory(
      categoriesResult.synced,
      itemsResult.synced,
      billsResult.synced
    );
    
    // Update last sync time
    const now = new Date().toISOString();
    await AsyncStorage.setItem('last_sync_time', now);
  }
  
  return {
    success,
    categoriesSynced: categoriesResult.synced,
    itemsSynced: itemsResult.synced,
    billsSynced: billsResult.synced,
  };
};

// ==================== INITIAL SYNC ====================

export const initialSync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('=== Starting initial sync from server ===');
    
    const online = await getNetworkStatus();
    if (!online) {
      return { success: false, error: 'No internet connection' };
    }
    
    const now = new Date().toISOString();
    
    // Download categories
    console.log('Downloading categories...');
    const categories = await API.categories.getAll();
    
    for (const category of categories) {
      executeSql(
        `INSERT OR REPLACE INTO categories 
         (id, name, description, is_active, sort_order, vendor_id, is_synced, server_updated_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category.id,
          category.name,
          category.description,
          category.is_active ? 1 : 0,
          category.sort_order,
          category.vendor_id || null,
          1,
          category.updated_at,
          category.created_at,
          now,
        ]
      );
    }
    
    console.log(`Downloaded ${categories.length} categories`);
    
    // Download items
    console.log('Downloading items...');
    const items = await API.items.getAll();
    
    for (const item of items) {
      executeSql(
        `INSERT OR REPLACE INTO items 
         (id, name, description, price, stock_quantity, sku, barcode, is_active, sort_order, 
          vendor_id, image_url, is_synced, server_updated_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.description,
          item.price,
          item.stock_quantity,
          item.sku,
          item.barcode,
          item.is_active ? 1 : 0,
          item.sort_order,
          item.vendor,
          item.image_url,
          1,
          item.last_updated,
          item.created_at,
          now,
        ]
      );
      
      executeSql('DELETE FROM item_categories WHERE item_id = ?', [item.id]);
      
      if (item.category_ids && item.category_ids.length > 0) {
        for (const categoryId of item.category_ids) {
          executeSql(
            'INSERT INTO item_categories (item_id, category_id, created_at) VALUES (?, ?, ?)',
            [item.id, categoryId, now]
          );
        }
      }
    }
    
    console.log(`Downloaded ${items.length} items`);
    
    // Save initial sync to history
    await saveSyncToHistory(categories.length, items.length, 0);
    
    // Update last sync time
    await AsyncStorage.setItem('last_sync_time', now);
    
    console.log('=== Initial sync complete ===');
    return { success: true };
  } catch (error: any) {
    console.error('Initial sync failed:', error);
    return { 
      success: false, 
      error: error.message || 'Initial sync failed' 
    };
  }
};

export default {
  initNetworkListener,
  getNetworkStatus,
  queueOperation,
  getPendingOperations,
  syncCategories,
  syncItems,
  syncBills,
  syncAll,
  initialSync,
};