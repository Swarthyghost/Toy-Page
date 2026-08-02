import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getSheetValues, updateSheetValues, appendToSheet } from '../lib/googleSheets';

export interface SheetProduct {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  price: number;
  currentStock: number;
  minimumStock: number;
  status: string;
}

// Fetch raw product catalog rows from Google Sheets
export async function fetchProductsFromSheets(): Promise<SheetProduct[]> {
  const values = await getSheetValues('Products!A2:H1000');
  if (!values) return [];

  return values
    .filter(row => row && row[0])
    .map(row => ({
      id: String(row[0]).trim(),
      name: String(row[1] || '').trim(),
      category: String(row[2] || 'Vibrators').trim(),
      costPrice: Number(row[3]) || 0,
      price: Number(row[4]) || 0,
      currentStock: Number(row[5]) || 0,
      minimumStock: Number(row[6]) || 0,
      status: String(row[7] || 'draft').trim(),
    }));
}

// Fetch sales from Google Sheets
export async function fetchSalesFromSheets(): Promise<any[]> {
  const values = await getSheetValues('Sales!A2:L10000');
  if (!values) return [];

  return values
    .filter(row => row && row[0])
    .map(row => ({
      id: String(row[0]).trim(),
      createdAt: row[1] ? new Date(row[1]) : new Date(),
      productName: String(row[2] || '').trim(),
      quantity: Number(row[3]) || 0,
      price: Number(row[4]) || 0,
      costPrice: Number(row[5]) || 0,
      profit: Number(row[6]) || 0,
      platform: String(row[7] || '').trim(),
      paymentMethod: String(row[8] || '').trim(),
      discount: Number(row[9]) || 0,
      deliveryFee: Number(row[10]) || 0,
      notes: String(row[11] || '').trim(),
    }));
}

// Fetch expenses from Google Sheets
export async function fetchExpensesFromSheets(): Promise<any[]> {
  const values = await getSheetValues('Expenses!A2:E10000');
  if (!values) return [];

  return values
    .filter(row => row && row[0])
    .map(row => ({
      id: String(row[0]).trim(),
      createdAt: row[1] ? new Date(row[1]) : new Date(),
      category: String(row[2] || '').trim(),
      amount: Number(row[3]) || 0,
      description: String(row[4] || '').trim(),
    }));
}

// Fetch inventory logs from Google Sheets
export async function fetchLogsFromSheets(): Promise<any[]> {
  const values = await getSheetValues('InventoryLogs!A2:H10000');
  if (!values) return [];

  return values
    .filter(row => row && row[0])
    .map(row => ({
      id: String(row[0]).trim(),
      createdAt: row[1] ? new Date(row[1]) : new Date(),
      productId: String(row[2] || '').trim(),
      productName: String(row[3] || '').trim(),
      type: String(row[4] || '').trim(),
      changeQty: Number(row[5]) || 0,
      newQty: Number(row[6]) || 0,
      reason: String(row[7] || '').trim(),
    }));
}

// Synchronize all Google Sheets data models into the Firestore cache
export async function syncAllSheetsToFirestore(): Promise<{ success: boolean; counts: any }> {
  try {
    const [sheetsProducts, sheetsSales, sheetsExpenses, sheetsLogs] = await Promise.all([
      fetchProductsFromSheets(),
      fetchSalesFromSheets(),
      fetchExpensesFromSheets(),
      fetchLogsFromSheets()
    ]);

    const batch = writeBatch(db);
    const counts = { products: 0, sales: 0, expenses: 0, inventory_logs: 0 };

    // 1. Sync Products
    const productsSnap = await getDocs(collection(db, 'products'));
    const fsProducts = new Map<string, any>();
    productsSnap.forEach(d => fsProducts.set(d.id, d.data()));
    const sheetProductIds = new Set<string>();

    for (const sp of sheetsProducts) {
      sheetProductIds.add(sp.id);
      const existing = fsProducts.get(sp.id);
      const isOutOfStock = sp.currentStock <= 0;
      const payload = {
        name: sp.name,
        category: sp.category,
        costPrice: sp.costPrice,
        price: sp.price,
        currentStock: sp.currentStock,
        minimumStock: sp.minimumStock,
        isOutOfStock,
        updatedAt: new Date(),
      };

      if (existing) {
        batch.set(doc(db, 'products', sp.id), { ...existing, ...payload });
      } else {
        batch.set(doc(db, 'products', sp.id), {
          ...payload,
          image: '',
          images: [],
          description: '',
          featured: false,
          hide_product: false,
          createdAt: new Date(),
        });
      }
      counts.products++;
    }
    // Delete removed products
    for (const [id] of fsProducts) {
      if (!sheetProductIds.has(id)) {
        batch.delete(doc(db, 'products', id));
      }
    }

    // 2. Sync Sales
    const salesSnap = await getDocs(collection(db, 'sales'));
    const fsSales = new Set(salesSnap.docs.map(d => d.id));
    const sheetSalesIds = new Set<string>();

    for (const ss of sheetsSales) {
      sheetSalesIds.add(ss.id);
      if (!fsSales.has(ss.id)) {
        batch.set(doc(db, 'sales', ss.id), ss);
      } else {
        batch.set(doc(db, 'sales', ss.id), ss, { merge: true });
      }
      counts.sales++;
    }
    // Delete removed sales
    for (const docId of fsSales) {
      if (!sheetSalesIds.has(docId)) {
        batch.delete(doc(db, 'sales', docId));
      }
    }

    // 3. Sync Expenses
    const expensesSnap = await getDocs(collection(db, 'expenses'));
    const fsExpenses = new Set(expensesSnap.docs.map(d => d.id));
    const sheetExpensesIds = new Set<string>();

    for (const se of sheetsExpenses) {
      sheetExpensesIds.add(se.id);
      if (!fsExpenses.has(se.id)) {
        batch.set(doc(db, 'expenses', se.id), se);
      } else {
        batch.set(doc(db, 'expenses', se.id), se, { merge: true });
      }
      counts.expenses++;
    }
    // Delete removed expenses
    for (const docId of fsExpenses) {
      if (!sheetExpensesIds.has(docId)) {
        batch.delete(doc(db, 'expenses', docId));
      }
    }

    // 4. Sync Inventory Logs
    const logsSnap = await getDocs(collection(db, 'inventory_logs'));
    const fsLogs = new Set(logsSnap.docs.map(d => d.id));
    const sheetLogsIds = new Set<string>();

    for (const sl of sheetsLogs) {
      sheetLogsIds.add(sl.id);
      if (!fsLogs.has(sl.id)) {
        batch.set(doc(db, 'inventory_logs', sl.id), sl);
      } else {
        batch.set(doc(db, 'inventory_logs', sl.id), sl, { merge: true });
      }
      counts.inventory_logs++;
    }
    // Delete removed logs
    for (const docId of fsLogs) {
      if (!sheetLogsIds.has(docId)) {
        batch.delete(doc(db, 'inventory_logs', docId));
      }
    }

    await batch.commit();
    return { success: true, counts };
  } catch (error) {
    console.error('Error in syncAllSheetsToFirestore:', error);
    return { success: false, counts: null };
  }
}

// Decrement stock quantity directly in Google Sheets, then sync to Firestore
export async function decrementStockInSheets(productId: string, quantity: number): Promise<boolean> {
  try {
    const values = await getSheetValues('Products!A2:H1000');
    if (!values) return false;

    const rowIndex = values.findIndex(row => row && String(row[0]).trim() === productId);
    if (rowIndex === -1) {
      console.error(`Product ID ${productId} not found in Google Sheets.`);
      return false;
    }

    const currentRow = values[rowIndex];
    const currentStock = Number(currentRow[5]) || 0;
    const newStock = Math.max(0, currentStock - quantity);

    const sheetRowNumber = rowIndex + 2;
    await updateSheetValues(`Products!F${sheetRowNumber}`, [[newStock]]);

    // Sync specific product to Firestore immediately for live cache updates
    const productsSnap = await getDocs(collection(db, 'products'));
    const fsProducts = new Map<string, any>();
    productsSnap.forEach(d => fsProducts.set(d.id, d.data()));

    const existing = fsProducts.get(productId);
    if (existing) {
      await setDoc(doc(db, 'products', productId), {
        ...existing,
        currentStock: newStock,
        isOutOfStock: newStock <= 0,
        updatedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error(`Error decrementing stock for product ${productId}:`, error);
    return false;
  }
}
