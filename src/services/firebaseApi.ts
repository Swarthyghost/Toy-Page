import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy,
  Timestamp,
  onSnapshot,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  isOutOfStock: boolean;
  featured?: boolean;
  hide_product?: boolean;
  costPrice?: number;
  openingStock?: number;
  currentStock?: number;
  minimumStock?: number;
  status?: 'active' | 'draft' | 'archived';
  productName?: string;
  sellingPrice?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount?: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export interface SiteSettings {
  isSalesNotificationActive: boolean;
  salesNotificationText: string;
  isDiscountTagsActive: boolean;
  lowStockAlertThreshold?: number;
  expenseMonthlyBudget?: number;
  monthlySalesTarget?: number;
}

const PRODUCTS_COLLECTION = 'products';
const PROMOS_COLLECTION = 'promoCodes';
const SETTINGS_COLLECTION = 'settings';

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Product;
  }
  return null;
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File, additionalImageFiles?: File[]): Promise<string> => {
  let imageUrl = productData.image;
  let additionalImageUrls: string[] = productData.images || [];
  
  try {
    // Upload main image if file is provided
    if (imageFile) {
      console.log('Uploading main image:', imageFile.name);
      imageUrl = await uploadImage(imageFile);
      console.log('Main image uploaded successfully:', imageUrl);
    } else if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Product+Image';
    }

    // Upload additional images if files are provided
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      console.log(`Uploading ${additionalImageFiles.length} additional images`);
      const uploadPromises = additionalImageFiles.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      additionalImageUrls = [...additionalImageUrls, ...uploadedUrls];
      console.log('Additional images uploaded successfully');
    }

    const product = {
      ...productData,
      image: imageUrl,
      images: additionalImageUrls,
      isOutOfStock: productData.isOutOfStock || false,
      featured: productData.featured || false,
      hide_product: productData.hide_product || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating product with data:', product);

    if (product.featured) {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('featured', '==', true));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { 
          featured: false,
          updatedAt: Timestamp.now() 
        });
      });
      
      const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
      batch.set(newDocRef, product);
      
      await batch.commit();
      console.log('Product created with ID (via batch):', newDocRef.id);
      return newDocRef.id;
    } else {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
      console.log('Product created with ID:', docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>, imageFile?: File, additionalImageFiles?: File[]): Promise<void> => {
  let imageUrl = productData.image;
  let additionalImageUrls = productData.images || [];
  
  // Upload main image if file is provided
  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  // Upload additional images if files are provided
  if (additionalImageFiles && additionalImageFiles.length > 0) {
    const uploadPromises = additionalImageFiles.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    additionalImageUrls = [...additionalImageUrls, ...uploadedUrls];
  }

  const updates = {
    ...productData,
    ...(imageUrl && { image: imageUrl }),
    images: additionalImageUrls,
    updatedAt: Timestamp.now(),
  };

  const docRef = doc(db, PRODUCTS_COLLECTION, id);

  if (productData.featured === true) {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('featured', '==', true));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((docSnap) => {
      if (docSnap.id !== id) {
        batch.update(docSnap.ref, { 
          featured: false,
          updatedAt: Timestamp.now() 
        });
      }
    });
    
    batch.update(docRef, updates);
    await batch.commit();
  } else {
    await updateDoc(docRef, updates);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const updateProductsVisibility = async (ids: string[], hideProduct: boolean): Promise<void> => {
  try {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      batch.update(docRef, { 
        hide_product: hideProduct,
        updatedAt: Timestamp.now()
      });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error in updateProductsVisibility:", error);
    throw error;
  }
};

// Promo Codes API
export const fetchPromoCodes = async (): Promise<PromoCode[]> => {
  const q = query(collection(db, PROMOS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PromoCode));
};

export const createPromoCode = async (promoData: Omit<PromoCode, 'id' | 'createdAt' | 'currentUses'>): Promise<string> => {
  const promo = {
    ...promoData,
    currentUses: 0,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, PROMOS_COLLECTION), promo);
  return docRef.id;
};

export const updatePromoCode = async (id: string, promoData: Partial<PromoCode>): Promise<void> => {
  const docRef = doc(db, PROMOS_COLLECTION, id);
  await updateDoc(docRef, promoData);
};

export const deletePromoCode = async (id: string): Promise<void> => {
  const docRef = doc(db, PROMOS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
  const q = query(collection(db, PROMOS_COLLECTION));
  const querySnapshot = await getDocs(q);
  
  const promo = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as PromoCode))
    .find(p => p.code === code && p.isActive);
  
  if (!promo) return null;
  
  // Check if expired
  if (promo.expiresAt && promo.expiresAt.toDate() < new Date()) {
    return null;
  }
  
  // Check if max uses reached
  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    return null;
  }
  
  return promo;
};

export const usePromoCode = async (id: string): Promise<void> => {
  const docRef = doc(db, PROMOS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentUses = docSnap.data().currentUses || 0;
    await updateDoc(docRef, { currentUses: currentUses + 1 });
  }
};

// Site Settings API
export const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      isSalesNotificationActive: data.isSalesNotificationActive || false,
      salesNotificationText: data.salesNotificationText || '',
      isDiscountTagsActive: data.isDiscountTagsActive !== undefined ? data.isDiscountTagsActive : true
    };
  }
  return null;
};

export const subscribeToSiteSettings = (callback: (settings: SiteSettings | null) => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        isSalesNotificationActive: data.isSalesNotificationActive || false,
        salesNotificationText: data.salesNotificationText || '',
        isDiscountTagsActive: data.isDiscountTagsActive !== undefined ? data.isDiscountTagsActive : true
      });
    } else {
      callback(null);
    }
  });
};

export const updateSiteSettings = async (settingsData: Partial<SiteSettings>): Promise<void> => {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...settingsData });
  } else {
    await setDoc(docRef, settingsData);
  }
};

// Customer Orders API
export interface CustomerOrder {
  id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  paymentMethod: "WhatsApp" | "Paystack";
  createdAt?: Timestamp;
}

export const saveOrder = async (orderData: Omit<CustomerOrder, "createdAt">): Promise<string> => {
  try {
    const order = {
      ...orderData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "orders"), order);
    return docRef.id;
  } catch (error) {
    console.error("Error in saveOrder:", error);
    throw error;
  }
};

export const fetchOrders = async (): Promise<CustomerOrder[]> => {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomerOrder));
  } catch (error) {
    console.error("Error in fetchOrders:", error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, orderData: Partial<CustomerOrder>): Promise<void> => {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, orderData);
  } catch (error) {
    console.error("Error in updateOrder:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const docRef = doc(db, "orders", orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    throw error;
  }
};

// Guides API
export interface Guide {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  featuredImageAlt: string;
  excerpt: string;
  body: string;
  category: string;
  status: 'draft' | 'published';
  publishDate: Timestamp;
  metaTitle: string;
  metaDescription: string;
  isFeatured: boolean;
  relatedProductIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const GUIDES_COLLECTION = 'guides';

export const fetchGuides = async (): Promise<Guide[]> => {
  try {
    const q = query(collection(db, GUIDES_COLLECTION), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Guide));
  } catch (error) {
    console.error("Error in fetchGuides:", error);
    throw error;
  }
};

export const fetchPublishedGuides = async (): Promise<Guide[]> => {
  try {
    const q = query(collection(db, GUIDES_COLLECTION), where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    const now = new Date();
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Guide))
      .filter(guide => {
        const pubDate = guide.publishDate?.toDate();
        return pubDate && pubDate <= now;
      })
      .sort((a, b) => {
        const dateA = a.publishDate?.toDate().getTime() || 0;
        const dateB = b.publishDate?.toDate().getTime() || 0;
        return dateB - dateA;
      });
  } catch (error) {
    console.error("Error in fetchPublishedGuides:", error);
    throw error;
  }
};

export const fetchGuideBySlug = async (slug: string): Promise<Guide | null> => {
  try {
    const q = query(collection(db, GUIDES_COLLECTION), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Guide;
  } catch (error) {
    console.error("Error in fetchGuideBySlug:", error);
    throw error;
  }
};

export const createGuide = async (guideData: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File): Promise<string> => {
  try {
    let imageUrl = guideData.featuredImage;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    const guide = {
      ...guideData,
      featuredImage: imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, GUIDES_COLLECTION), guide);
    return docRef.id;
  } catch (error) {
    console.error("Error in createGuide:", error);
    throw error;
  }
};

export const updateGuide = async (id: string, guideData: Partial<Guide>, imageFile?: File): Promise<void> => {
  try {
    let imageUrl = guideData.featuredImage;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    const updates = {
      ...guideData,
      ...(imageUrl && { featuredImage: imageUrl }),
      updatedAt: Timestamp.now(),
    };
    const docRef = doc(db, GUIDES_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error in updateGuide:", error);
    throw error;
  }
};

export const deleteGuide = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, GUIDES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteGuide:", error);
    throw error;
  }
};

// ==========================================
// RETAIL OS DATABASE LAYERS
// ==========================================

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number; // selling price
  costPrice: number;
  profit: number; // calculated automatically
  platform: 'Website' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'Jiji' | 'Walk-in' | 'Referral';
  paymentMethod: 'Cash' | 'MoMo' | 'Card' | 'Bank Transfer';
  discount?: number;
  deliveryFee?: number;
  notes?: string;
  createdAt: Timestamp;
}

export interface Expense {
  id?: string;
  category: 'Fuel' | 'Packaging' | 'Delivery' | 'Advertising' | 'Rent' | 'Internet' | 'Electricity' | 'Stock Purchase' | 'Miscellaneous';
  amount: number;
  description: string;
  receiptImage?: string;
  createdAt: Timestamp;
}

export interface InventoryLog {
  id?: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  changeQty: number;
  newQty: number;
  reason: string;
  createdAt: Timestamp;
}

export interface StockAdjustment {
  id?: string;
  productId: string;
  productName: string;
  adjustQty: number;
  type: 'add' | 'remove';
  reason: string;
  createdAt: Timestamp;
}

export interface PurchaseOrder {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'stock' | 'expense' | 'target';
  isRead: boolean;
  createdAt: Timestamp;
}

// Collections constants
const SALES_COLLECTION = 'sales';
const EXPENSES_COLLECTION = 'expenses';
const INVENTORY_LOGS_COLLECTION = 'inventory_logs';
const STOCK_ADJUSTMENTS_COLLECTION = 'stock_adjustments';
const PURCHASE_ORDERS_COLLECTION = 'purchase_orders';
const NOTIFICATIONS_COLLECTION = 'notifications';

// --- INVENTORY LOGS API ---
export const fetchInventoryLogs = async (): Promise<InventoryLog[]> => {
  try {
    const q = query(collection(db, INVENTORY_LOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLog));
  } catch (error) {
    console.error('Error in fetchInventoryLogs:', error);
    throw error;
  }
};

export const logInventoryChange = async (data: Omit<InventoryLog, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const logId = doc(collection(db, INVENTORY_LOGS_COLLECTION)).id;
    const createdAtStr = new Date().toISOString();
    
    await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inventory_log',
        data: {
          ...data,
          id: logId,
          createdAt: createdAtStr
        }
      })
    });
    
    return logId;
  } catch (error) {
    console.error('Error in logInventoryChange:', error);
    throw error;
  }
};

// --- STOCK ADJUSTMENTS API ---
export const fetchStockAdjustments = async (): Promise<StockAdjustment[]> => {
  try {
    const q = query(collection(db, STOCK_ADJUSTMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockAdjustment));
  } catch (error) {
    console.error('Error in fetchStockAdjustments:', error);
    throw error;
  }
};

export const logStockAdjustment = async (data: Omit<StockAdjustment, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const adjustment = { ...data, createdAt: Timestamp.now() };
    const docRef = await addDoc(collection(db, STOCK_ADJUSTMENTS_COLLECTION), adjustment);

    // Update Product Stock
    const productRef = doc(db, PRODUCTS_COLLECTION, data.productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const product = productSnap.data() as Product;
      const currentVal = product.currentStock !== undefined ? product.currentStock : 0;
      const adjustQty = data.adjustQty;
      const newStock = Math.max(0, data.type === 'add' ? currentVal + adjustQty : currentVal - adjustQty);

      await updateDoc(productRef, {
        currentStock: newStock,
        isOutOfStock: newStock === 0 ? true : product.isOutOfStock
      });

      // Log Inventory Change
      await logInventoryChange({
        productId: data.productId,
        productName: data.productName,
        type: 'adjustment',
        changeQty: adjustQty,
        newQty: newStock,
        reason: `Manual Adjustment: ${data.reason}`
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error in logStockAdjustment:', error);
    throw error;
  }
};

// --- SALES API ---
export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
  } catch (error) {
    console.error('Error in fetchSales:', error);
    throw error;
  }
};

export const logSale = async (saleData: Omit<Sale, 'createdAt'>): Promise<string> => {
  try {
    const saleId = doc(collection(db, SALES_COLLECTION)).id;
    const createdAtStr = new Date().toISOString();

    const salePayload = {
      ...saleData,
      id: saleId,
      createdAt: createdAtStr
    };

    // 1. Write the sale transaction directly to the Sales Google Sheet
    await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sale', data: salePayload })
    });

    // 2. Reduce the product stock quantity in the master Google Sheet
    await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'decrement_stock', data: { productId: saleData.productId, quantity: saleData.quantity } })
    });

    // 3. Write the inventory log straight to Google Sheets
    const logId = doc(collection(db, INVENTORY_LOGS_COLLECTION)).id;
    await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inventory_log',
        data: {
          id: logId,
          productId: saleData.productId,
          productName: saleData.productName,
          type: 'out',
          changeQty: saleData.quantity,
          newQty: 0,
          reason: `Logged Sale (ID: ${saleId})`,
          createdAt: createdAtStr
        }
      })
    });

    // 4. Low stock warning (optional check in cache if needed)
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, saleData.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const product = productSnap.data() as Product;
        const currentStock = product.currentStock !== undefined ? product.currentStock : 0;
        const newStock = Math.max(0, currentStock - saleData.quantity);
        const minStock = product.minimumStock !== undefined ? product.minimumStock : 5;
        if (newStock <= minStock) {
          await createNotification({
            title: 'Low Stock Alert',
            message: `Product "${product.name}" is low on stock (${newStock} units left).`,
            type: 'stock',
            isRead: false
          });
        }
      }
    } catch (e) {
      console.error('Failed to trigger low stock notification:', e);
    }

    return saleId;
  } catch (error) {
    console.error('Error in logSale:', error);
    throw error;
  }
};

export const deleteSale = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SALES_COLLECTION, id));
  } catch (error) {
    console.error('Error in deleteSale:', error);
    throw error;
  }
};

// --- EXPENSES API ---
export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const q = query(collection(db, EXPENSES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  } catch (error) {
    console.error('Error in fetchExpenses:', error);
    throw error;
  }
};

export const logExpense = async (data: Omit<Expense, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const expenseId = doc(collection(db, EXPENSES_COLLECTION)).id;
    const createdAtStr = new Date().toISOString();

    const expensePayload = {
      ...data,
      id: expenseId,
      createdAt: createdAtStr
    };

    // Write directly to Google Sheets
    await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'expense', data: expensePayload })
    });

    return expenseId;
  } catch (error) {
    console.error('Error in logExpense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    throw error;
  }
};

// --- PURCHASE ORDERS API ---
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const q = query(collection(db, PURCHASE_ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
  } catch (error) {
    console.error('Error in fetchPurchaseOrders:', error);
    throw error;
  }
};

export const createPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const po = { ...data, createdAt: Timestamp.now() };
    const docRef = await addDoc(collection(db, PURCHASE_ORDERS_COLLECTION), po);
    return docRef.id;
  } catch (error) {
    console.error('Error in createPurchaseOrder:', error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id: string, data: Partial<PurchaseOrder>): Promise<void> => {
  try {
    const poRef = doc(db, PURCHASE_ORDERS_COLLECTION, id);
    const poSnap = await getDoc(poRef);
    if (!poSnap.exists()) return;
    const oldPo = poSnap.data() as PurchaseOrder;

    await updateDoc(poRef, data);

    // Restock stock completed
    if (oldPo.status === 'pending' && data.status === 'completed') {
      const productRef = doc(db, PRODUCTS_COLLECTION, oldPo.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const product = productSnap.data() as Product;
        const currentStock = product.currentStock !== undefined ? product.currentStock : 0;
        const newStock = currentStock + oldPo.quantity;

        // Recalculate average cost price
        const currentCost = product.costPrice || 0;
        const totalItemsInStockBefore = currentStock;
        const newItemsCost = oldPo.costPrice * oldPo.quantity;
        const totalCost = (currentCost * totalItemsInStockBefore) + newItemsCost;
        const newAverageCost = newStock > 0 ? parseFloat((totalCost / newStock).toFixed(2)) : oldPo.costPrice;

        await updateDoc(productRef, {
          currentStock: newStock,
          costPrice: newAverageCost,
          isOutOfStock: false
        });

        // Log to inventory changes
        await logInventoryChange({
          productId: oldPo.productId,
          productName: oldPo.productName,
          type: 'in',
          changeQty: oldPo.quantity,
          newQty: newStock,
          reason: `Restocked via PO completed (ID: ${id})`
        });
      }
    }
  } catch (error) {
    console.error('Error in updatePurchaseOrder:', error);
    throw error;
  }
};

// --- NOTIFICATIONS API ---
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    throw error;
  }
};

export const createNotification = async (data: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const notification = { ...data, createdAt: Timestamp.now() };
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    return docRef.id;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), { isRead: true });
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    throw error;
  }
};

