import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getSheetValues, updateSheetValues } from '../lib/googleSheets';

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
  if (!values) {
    console.warn('Empty product values returned from Google Sheets.');
    return [];
  }

  return values
    .filter(row => row && row[0]) // must have ID
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

// Synchronize Google Sheets product catalog directly into the Firestore cache
export async function syncSheetsToFirestore(): Promise<{ success: boolean; syncedCount: number }> {
  try {
    const sheetsProducts = await fetchProductsFromSheets();
    if (sheetsProducts.length === 0) {
      return { success: false, syncedCount: 0 };
    }

    // Get existing products in Firestore cache
    const productsSnap = await getDocs(collection(db, 'products'));
    const firestoreProducts = new Map<string, any>();
    productsSnap.forEach(docSnap => {
      firestoreProducts.set(docSnap.id, docSnap.data());
    });

    const batch = writeBatch(db);
    let syncedCount = 0;

    const sheetsProductIds = new Set<string>();

    for (const sp of sheetsProducts) {
      sheetsProductIds.add(sp.id);
      const existing = firestoreProducts.get(sp.id);
      
      const isOutOfStock = sp.currentStock <= 0;

      const productPayload = {
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
        // Update product - merge with existing fields to preserve image, description, featured status, etc.
        const productRef = doc(db, 'products', sp.id);
        batch.set(productRef, {
          ...existing,
          ...productPayload,
        });
      } else {
        // Create new product in cache
        const productRef = doc(db, 'products', sp.id);
        batch.set(productRef, {
          ...productPayload,
          image: '',
          images: [],
          description: '',
          featured: false,
          hide_product: false,
          createdAt: new Date(),
        });
      }
      syncedCount++;
    }

    // Identify deleted products (in Firestore but missing from Sheets)
    for (const [id] of firestoreProducts) {
      if (!sheetsProductIds.has(id)) {
        console.log(`Product ${id} deleted in Sheets. Removing from Firestore cache.`);
        const productRef = doc(db, 'products', id);
        batch.delete(productRef);
      }
    }

    await batch.commit();
    console.log(`Synced ${syncedCount} products to Firestore cache.`);
    return { success: true, syncedCount };
  } catch (error) {
    console.error('Error synchronizing Google Sheets to Firestore:', error);
    return { success: false, syncedCount: 0 };
  }
}

// Decrement stock quantity directly in Google Sheets, then sync to Firestore
export async function decrementStockInSheets(productId: string, quantity: number): Promise<boolean> {
  try {
    const values = await getSheetValues('Products!A2:H1000');
    if (!values) return false;

    // Find row index of the product (0-indexed offset by 2 for the sheet row number)
    const rowIndex = values.findIndex(row => row && String(row[0]).trim() === productId);
    if (rowIndex === -1) {
      console.error(`Product ID ${productId} not found in Google Sheets.`);
      return false;
    }

    const currentRow = values[rowIndex];
    const currentStock = Number(currentRow[5]) || 0;
    const newStock = Math.max(0, currentStock - quantity);

    // Update F cell (current stock column is index 5 -> 'F')
    const sheetRowNumber = rowIndex + 2;
    await updateSheetValues(`Products!F${sheetRowNumber}`, [[newStock]]);

    // Sync specific product to Firestore immediately for live cache updates
    const productsSnap = await getDocs(collection(db, 'products'));
    const firestoreProducts = new Map<string, any>();
    productsSnap.forEach(docSnap => {
      if (docSnap.id === productId) {
        firestoreProducts.set(docSnap.id, docSnap.data());
      }
    });

    const existing = firestoreProducts.get(productId);
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
