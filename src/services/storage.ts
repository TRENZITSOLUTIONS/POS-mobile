// src/services/storage.ts
import { getDatabase } from '../database/schema';
import { queueOperation } from './sync';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

// Helper to execute SQL and return results
const executeSql = (sql: string, params: any[] = []): any[] => {
  const db = getDatabase();
  const result = db.execute(sql, params);
  return result.rows?._array || [];
};

// ==================== CATEGORIES ====================

export const getCategories = async (includeInactive = false): Promise<any[]> => {
  try {
    const query = includeInactive
      ? 'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY sort_order ASC, name ASC'
      : 'SELECT * FROM categories WHERE is_active = 1 AND deleted_at IS NULL ORDER BY sort_order ASC, name ASC';
    
    return executeSql(query);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<any | null> => {
  try {
    const results = executeSql(
      'SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to get category:', error);
    return null;
  }
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  sort_order?: number;
}): Promise<string> => {
  const id = uuidv4();
  const timestamp = now();
  
  try {
    executeSql(
      `INSERT INTO categories 
       (id, name, description, is_active, sort_order, is_synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        1,
        data.sort_order || 0,
        0,
        timestamp,
        timestamp,
      ]
    );
    
    // Queue for sync
    await queueOperation({
      operation_type: 'create',
      entity_type: 'category',
      entity_id: id,
      data: {
        id,
        name: data.name,
        description: data.description,
        sort_order: data.sort_order || 0,
        is_active: true,
      },
      timestamp,
    });
    
    console.log(`Category created: ${id}`);
    return id;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

export const updateCategory = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    is_active: boolean;
    sort_order: number;
  }>
): Promise<void> => {
  const timestamp = now();
  
  try {
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }
    if (data.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      values.push(data.sort_order);
    }
    
    updateFields.push('is_synced = ?', 'updated_at = ?');
    values.push(0, timestamp);
    
    values.push(id);
    
    executeSql(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Queue for sync
    await queueOperation({
      operation_type: 'update',
      entity_type: 'category',
      entity_id: id,
      data,
      timestamp,
    });
    
    console.log(`Category updated: ${id}`);
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const timestamp = now();
  
  try {
    executeSql(
      'UPDATE categories SET deleted_at = ?, is_synced = ? WHERE id = ?',
      [timestamp, 0, id]
    );
    
    // Queue for sync
    await queueOperation({
      operation_type: 'delete',
      entity_type: 'category',
      entity_id: id,
      data: {},
      timestamp,
    });
    
    console.log(`Category deleted: ${id}`);
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
};

// ==================== ITEMS ====================

export const getItems = async (options?: {
  categoryId?: string;
  search?: string;
  includeInactive?: boolean;
}): Promise<any[]> => {
  try {
    let query = `
      SELECT DISTINCT i.* 
      FROM items i
      LEFT JOIN item_categories ic ON i.id = ic.item_id
      WHERE i.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    
    if (!options?.includeInactive) {
      query += ' AND i.is_active = 1';
    }
    
    if (options?.categoryId) {
      query += ' AND ic.category_id = ?';
      params.push(options.categoryId);
    }
    
    if (options?.search) {
      query += ' AND (i.name LIKE ? OR i.description LIKE ? OR i.sku LIKE ? OR i.barcode LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.sort_order ASC, i.name ASC';
    
    const items = executeSql(query, params);
    
    // Get categories for each item
    for (const item of items) {
      const categories = executeSql(
        `SELECT c.id, c.name 
         FROM categories c
         INNER JOIN item_categories ic ON c.id = ic.category_id
         WHERE ic.item_id = ?`,
        [item.id]
      );
      
      item.categories = categories;
      item.category_ids = categories.map((c: any) => c.id);
    }
    
    return items;
  } catch (error) {
    console.error('Failed to get items:', error);
    return [];
  }
};

export const getItemById = async (id: string): Promise<any | null> => {
  try {
    const results = executeSql(
      'SELECT * FROM items WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (results.length === 0) return null;
    
    const item = results[0];
    
    // Get categories
    const categories = executeSql(
      `SELECT c.id, c.name 
       FROM categories c
       INNER JOIN item_categories ic ON c.id = ic.category_id
       WHERE ic.item_id = ?`,
      [id]
    );
    
    item.categories = categories;
    item.category_ids = categories.map((c: any) => c.id);
    
    return item;
  } catch (error) {
    console.error('Failed to get item:', error);
    return null;
  }
};

export const createItem = async (data: {
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  sku?: string;
  barcode?: string;
  category_ids?: string[];
  image_path?: string;
  image_url?: string;
  sort_order?: number;
}): Promise<string> => {
  const id = uuidv4();
  const timestamp = now();
  
  try {
    // Insert item
    executeSql(
      `INSERT INTO items 
      (id, name, description, price, stock_quantity, sku, barcode, is_active, sort_order, image_path, image_url, is_synced, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.price,
        data.stock_quantity || 0,
        data.sku || null,
        data.barcode || null,
        1,
        data.sort_order || 0,
        data.image_path || null,
        data.image_url || null,
        0,
        timestamp,
        timestamp,
      ]
    );
    
    // Insert item-category relationships
    if (data.category_ids && data.category_ids.length > 0) {
      for (const categoryId of data.category_ids) {
        executeSql(
          'INSERT INTO item_categories (item_id, category_id, created_at) VALUES (?, ?, ?)',
          [id, categoryId, timestamp]
        );
      }
    }
    
    // Queue for sync
    await queueOperation({
      operation_type: 'create',
      entity_type: 'item',
      entity_id: id,
      data: {
        id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity || 0,
        sku: data.sku,
        barcode: data.barcode,
        category_ids: data.category_ids || [],
        image_path: data.image_path,
        image_url: data.image_url,
        sort_order: data.sort_order || 0,
        is_active: true,
      },
      timestamp,
    });
    
    console.log(`Item created: ${id}`);
    return id;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

export const updateItem = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    barcode: string;
    is_active: boolean;
    category_ids: string[];
    sort_order: number;
  }>
): Promise<void> => {
  const timestamp = now();
  
  try {
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      updateFields.push('price = ?');
      values.push(data.price);
    }
    if (data.stock_quantity !== undefined) {
      updateFields.push('stock_quantity = ?');
      values.push(data.stock_quantity);
    }
    if (data.sku !== undefined) {
      updateFields.push('sku = ?');
      values.push(data.sku);
    }
    if (data.barcode !== undefined) {
      updateFields.push('barcode = ?');
      values.push(data.barcode);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }
    if (data.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      values.push(data.sort_order);
    }
    
    updateFields.push('is_synced = ?', 'updated_at = ?');
    values.push(0, timestamp);
    
    values.push(id);
    
    executeSql(
      `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Update categories if provided
    if (data.category_ids !== undefined) {
      executeSql('DELETE FROM item_categories WHERE item_id = ?', [id]);
      
      for (const categoryId of data.category_ids) {
        executeSql(
          'INSERT INTO item_categories (item_id, category_id, created_at) VALUES (?, ?, ?)',
          [id, categoryId, timestamp]
        );
      }
    }
    
    // Queue for sync
    await queueOperation({
      operation_type: 'update',
      entity_type: 'item',
      entity_id: id,
      data,
      timestamp,
    });
    
    console.log(`Item updated: ${id}`);
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const timestamp = now();
  
  try {
    executeSql(
      'UPDATE items SET deleted_at = ?, is_synced = ? WHERE id = ?',
      [timestamp, 0, id]
    );
    
    // Queue for sync
    await queueOperation({
      operation_type: 'delete',
      entity_type: 'item',
      entity_id: id,
      data: {},
      timestamp,
    });
    
    console.log(`Item deleted: ${id}`);
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};

// ==================== BILLS ====================

export const createBill = async (data: {
  bill_number: string;
  items: any[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  device_id: string;
}): Promise<string> => {
  const id = uuidv4();
  const timestamp = now();
  
  try {
    executeSql(
      `INSERT INTO bills 
       (id, bill_number, customer_name, customer_phone, items, subtotal, tax_amount, discount_amount, 
        total_amount, payment_method, notes, device_id, is_synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.bill_number,
        data.customer_name || null,
        data.customer_phone || null,
        JSON.stringify(data.items),
        data.subtotal,
        data.tax_amount,
        data.discount_amount,
        data.total_amount,
        data.payment_method || null,
        data.notes || null,
        data.device_id,
        0,
        timestamp,
        timestamp,
      ]
    );
    
    console.log(`Bill created: ${id}`);
    return id;
  } catch (error) {
    console.error('Failed to create bill:', error);
    throw error;
  }
};

export const getBills = async (options?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> => {
  try {
    let query = 'SELECT * FROM bills WHERE deleted_at IS NULL';
    const params: any[] = [];
    
    if (options?.startDate) {
      query += ' AND created_at >= ?';
      params.push(options.startDate);
    }
    
    if (options?.endDate) {
      query += ' AND created_at <= ?';
      params.push(options.endDate);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      
      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    const bills = executeSql(query, params);
    
    // Parse items JSON
    return bills.map(bill => ({
      ...bill,
      items: JSON.parse(bill.items),
    }));
  } catch (error) {
    console.error('Failed to get bills:', error);
    return [];
  }
};

export const getBillById = async (id: string): Promise<any | null> => {
  try {
    const results = executeSql(
      'SELECT * FROM bills WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (results.length === 0) return null;
    
    const bill = results[0];
    bill.items = JSON.parse(bill.items);
    
    return bill;
  } catch (error) {
    console.error('Failed to get bill:', error);
    return null;
  }
};

export const getUnsyncedBillsCount = async (): Promise<number> => {
  try {
    const results = executeSql(
      'SELECT COUNT(*) as count FROM bills WHERE is_synced = 0 AND deleted_at IS NULL'
    );
    
    return results[0]?.count || 0;
  } catch (error) {
    console.error('Failed to get unsynced bills count:', error);
    return 0;
  }
};

// Wrapper for createBill that handles device_id automatically
export const saveBill = async (data: {
  bill_number: string;
  items: string; // JSON string
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
}): Promise<string> => {
  try {
    // Parse items from JSON string to array
    const itemsArray = JSON.parse(data.items);
    
    // Get device ID (or generate one if not exists)
    let deviceId = '';
    const settings = await getBusinessSettings();
    if (settings && settings.device_id) {
      deviceId = settings.device_id;
    } else {
      deviceId = uuidv4();
      // Save device_id to settings
      await saveBusinessSettings({ device_id: deviceId });
    }
    
    // Call createBill with device_id
    return await createBill({
      bill_number: data.bill_number,
      items: itemsArray,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      discount_amount: data.discount_amount,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      notes: data.notes,
      device_id: deviceId,
    });
  } catch (error) {
    console.error('Failed to save bill:', error);
    throw error;
  }
};

// ==================== BUSINESS SETTINGS ====================

export const getBusinessSettings = async (): Promise<any | null> => {
  try {
    const results = executeSql('SELECT * FROM business_settings LIMIT 1');
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to get business settings:', error);
    return null;
  }
};

export const saveBusinessSettings = async (data: {
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  tax_rate?: number;
  currency?: string;
  bill_prefix?: string;
  bill_footer_note?: string;
  printer_name?: string;
  printer_type?: string;
  device_id?: string;
  admin_pin?: string;
  gst_type?: string;
  item_level_override?: number;
  rounding_rule?: string;
}): Promise<void> => {
  const timestamp = now();
  
  try {
    const existing = await getBusinessSettings();
    
    if (existing) {
      // Update
      const updateFields: string[] = [];
      const values: any[] = [];
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      updateFields.push('is_synced = ?', 'updated_at = ?');
      values.push(0, timestamp);
      values.push(existing.id);
      
      executeSql(
        `UPDATE business_settings SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
    } else {
      // Insert
      executeSql(
        `INSERT INTO business_settings 
         (business_name, business_address, business_phone, business_email, tax_rate, currency, 
          bill_prefix, bill_footer_note, printer_name, printer_type, device_id, admin_pin, 
          gst_type, item_level_override, rounding_rule, is_synced, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.business_name || null,
          data.business_address || null,
          data.business_phone || null,
          data.business_email || null,
          data.tax_rate || 0,
          data.currency || 'INR',
          data.bill_prefix || 'BILL',
          data.bill_footer_note || null,
          data.printer_name || null,
          data.printer_type || null,
          data.device_id || null,
          data.admin_pin || null,
          data.gst_type || 'Inclusive',
          data.item_level_override !== undefined ? data.item_level_override : 1,
          data.rounding_rule || 'nearest',
          0,
          timestamp,
          timestamp,
        ]
      );
    }
    
    console.log('Business settings saved');
  } catch (error) {
    console.error('Failed to save business settings:', error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  createBill,
  saveBill,
  getBills,
  getBillById,
  getUnsyncedBillsCount,
  getBusinessSettings,
  saveBusinessSettings,
};