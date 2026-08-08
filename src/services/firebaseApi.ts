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
import { toLocalDate } from '../utils/dateHelper';
import { slugify } from '../utils/seoHelper';
import { uploadImage } from '../config/cloudinary';

export interface Product {
  id: string;
  name: string;
  slug?: string;
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
  productType?: 'Adult Products' | 'General Merchandise';
  websiteVisibility?: 'Website' | 'Retail Only' | 'Both';
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
    ...doc.data(),
    id: doc.id
  } as Product));
};

export const generateUniqueSlug = async (name: string, productId?: string): Promise<string> => {
  const baseSlug = slugify(name);
  if (!baseSlug) return 'product';
  
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      const otherDocs = querySnapshot.docs.filter(doc => doc.id !== productId);
      if (otherDocs.length === 0) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
  }
  return slug;
};

export const fetchProductBySlugOrId = async (slugOrId: string): Promise<Product | null> => {
  if (!slugOrId) return null;
  const target = slugOrId.toLowerCase().trim();

  // 1. Try fetching by slug field directly
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', target));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        ...docSnap.data(),
        id: docSnap.id
      } as Product;
    }
  } catch (error) {
    console.error('Error fetching product by slug field:', error);
  }

  // 2. Try fetching by document ID
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, slugOrId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id
      } as Product;
    }
  } catch (e) {
    // Suppress invalid document path errors
  }

  // 3. Fallback: Search all products for a match on slugify(name) or slug field (legacy fallback)
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    for (const docObj of querySnapshot.docs) {
      const data = docObj.data();
      const name = data.name || '';
      const productSlug = data.slug || slugify(name);
      if (productSlug.toLowerCase().trim() === target || slugify(name) === target) {
        return {
          ...data,
          id: docObj.id
        } as Product;
      }
    }
  } catch (error) {
    console.error('Error in fetchProductBySlugOrId fallback:', error);
  }

  return null;
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  return fetchProductBySlugOrId(id);
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

    const slug = productData.slug || await generateUniqueSlug(productData.name);

    const product = {
      ...productData,
      slug,
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

  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  let existingSlug = docSnap.exists() ? docSnap.data().slug : undefined;

  let slug = productData.slug || existingSlug;
  if (!slug) {
    const name = productData.name || (docSnap.exists() ? docSnap.data().name : "");
    slug = await generateUniqueSlug(name, id);
  }

  const updates = {
    ...productData,
    slug,
    ...(imageUrl && { image: imageUrl }),
    images: additionalImageUrls,
    updatedAt: Timestamp.now(),
  };

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
    ...doc.data(),
    id: doc.id
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
    .map(doc => ({ ...doc.data(), id: doc.id } as PromoCode))
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
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryLog));
  } catch (error) {
    console.error('Error in fetchInventoryLogs:', error);
    throw error;
  }
};

export const logInventoryChange = async (data: Omit<InventoryLog, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const logId = doc(collection(db, INVENTORY_LOGS_COLLECTION)).id;
    const createdAt = Timestamp.now();
    
    await setDoc(doc(db, INVENTORY_LOGS_COLLECTION, logId), {
      ...data,
      id: logId,
      createdAt
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
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StockAdjustment));
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

const cleanUndefined = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

// --- SALES API ---
export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sale));
  } catch (error) {
    console.error('Error in fetchSales:', error);
    throw error;
  }
};

export const logSale = async (saleData: Omit<Sale, 'createdAt'> & { createdAt?: any }): Promise<string> => {
  try {
    if (!saleData.productId) throw new Error("Product ID is required.");
    if (saleData.quantity <= 0) throw new Error("Quantity must be greater than zero.");
    if (saleData.price <= 0) throw new Error("Selling price is required.");

    const saleId = doc(collection(db, SALES_COLLECTION)).id;
    let timestamp = Timestamp.now();
    if (saleData.createdAt) {
      const selectedDate = toLocalDate(saleData.createdAt);
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      timestamp = Timestamp.fromDate(selectedDate);
    }

    const salePayload = {
      ...saleData,
      id: saleId,
      createdAt: timestamp
    };

    // 1. Write the sale transaction directly to Firestore
    await setDoc(doc(db, SALES_COLLECTION, saleId), cleanUndefined(salePayload));

    // 2. Reduce the product stock quantity in Firestore
    const productRef = doc(db, PRODUCTS_COLLECTION, saleData.productId);
    const productSnap = await getDoc(productRef);
    let newStock = 0;
    let productName = saleData.productName;

    if (productSnap.exists()) {
      const product = productSnap.data() as Product;
      productName = product.name;
      const currentStock = product.currentStock !== undefined ? product.currentStock : 0;
      newStock = Math.max(0, currentStock - saleData.quantity);
      
      await updateDoc(productRef, {
        currentStock: newStock,
        isOutOfStock: newStock <= 0,
        updatedAt: timestamp
      });

      // 3. Low stock warning notification
      const minStock = product.minimumStock !== undefined ? product.minimumStock : 5;
      if (newStock <= minStock) {
        try {
          await createNotification({
            title: 'Low Stock Alert',
            message: `Product "${product.name}" is low on stock (${newStock} units left).`,
            type: 'stock',
            isRead: false
          });
        } catch (e) {
          console.error('Failed to trigger low stock notification:', e);
        }
      }
    }

    // 4. Write the inventory log straight to Firestore
    const logId = doc(collection(db, INVENTORY_LOGS_COLLECTION)).id;
    await setDoc(doc(db, INVENTORY_LOGS_COLLECTION, logId), {
      id: logId,
      productId: saleData.productId,
      productName: productName,
      type: 'out',
      changeQty: saleData.quantity,
      newQty: newStock,
      reason: `Logged Sale (ID: ${saleId})`,
      createdAt: timestamp
    });

    return saleId;
  } catch (error: any) {
    console.error('Error in logSale:', error);
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied.");
    }
    throw new Error(error.message || "Firestore write failed.");
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

export const updateSale = async (
  saleId: string, 
  updatedData: Omit<Sale, 'createdAt'> & { createdAt?: any }
): Promise<void> => {
  try {
    if (!updatedData.productId) throw new Error("Product ID is required.");
    if (updatedData.quantity <= 0) throw new Error("Quantity must be greater than zero.");
    if (updatedData.price <= 0) throw new Error("Selling price is required.");

    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) {
      throw new Error("Sale document not found.");
    }
    const originalSale = saleSnap.data() as Sale;

    let timestamp = originalSale.createdAt;
    if (updatedData.createdAt) {
      const selectedDate = toLocalDate(updatedData.createdAt);
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      timestamp = Timestamp.fromDate(selectedDate);
    }

    const isSameProduct = originalSale.productId === updatedData.productId;

    if (isSameProduct) {
      const qtyDiff = updatedData.quantity - originalSale.quantity;
      if (qtyDiff !== 0) {
        const productRef = doc(db, PRODUCTS_COLLECTION, updatedData.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const product = productSnap.data() as Product;
          const currentStock = product.currentStock !== undefined ? product.currentStock : 0;
          const newStock = Math.max(0, currentStock - qtyDiff);

          await updateDoc(productRef, {
            currentStock: newStock,
            isOutOfStock: newStock <= 0,
            updatedAt: Timestamp.now()
          });

          // Log inventory change
          await logInventoryChange({
            productId: updatedData.productId,
            productName: product.name,
            type: qtyDiff > 0 ? 'out' : 'in',
            changeQty: Math.abs(qtyDiff),
            newQty: newStock,
            reason: `Sale Edit (ID: ${saleId}) - Quantity adjusted from ${originalSale.quantity} to ${updatedData.quantity}`
          });
        }
      }
    } else {
      // Return stock to the old product
      const oldProductRef = doc(db, PRODUCTS_COLLECTION, originalSale.productId);
      const oldProductSnap = await getDoc(oldProductRef);
      if (oldProductSnap.exists()) {
        const oldProduct = oldProductSnap.data() as Product;
        const oldStock = oldProduct.currentStock !== undefined ? oldProduct.currentStock : 0;
        const newOldStock = oldStock + originalSale.quantity;

        await updateDoc(oldProductRef, {
          currentStock: newOldStock,
          isOutOfStock: newOldStock <= 0,
          updatedAt: Timestamp.now()
        });

        // Log inventory change for returning stock
        await logInventoryChange({
          productId: originalSale.productId,
          productName: oldProduct.name,
          type: 'in',
          changeQty: originalSale.quantity,
          newQty: newOldStock,
          reason: `Sale Edit (ID: ${saleId}) - Product changed (Returned stock)`
        });
      }

      // Deduct stock from the new product
      const newProductRef = doc(db, PRODUCTS_COLLECTION, updatedData.productId);
      const newProductSnap = await getDoc(newProductRef);
      if (newProductSnap.exists()) {
        const newProduct = newProductSnap.data() as Product;
        const newStockVal = newProduct.currentStock !== undefined ? newProduct.currentStock : 0;
        const newNewStock = Math.max(0, newStockVal - updatedData.quantity);

        await updateDoc(newProductRef, {
          currentStock: newNewStock,
          isOutOfStock: newNewStock <= 0,
          updatedAt: Timestamp.now()
        });

        // Log inventory change for new deduction
        await logInventoryChange({
          productId: updatedData.productId,
          productName: newProduct.name,
          type: 'out',
          changeQty: updatedData.quantity,
          newQty: newNewStock,
          reason: `Sale Edit (ID: ${saleId}) - Product changed (Deducted stock)`
        });
      }
    }

    // 2. Update the sale record in Firestore
    await setDoc(saleRef, cleanUndefined({
      ...updatedData,
      id: saleId,
      createdAt: timestamp
    }), { merge: true });
  } catch (error: any) {
    console.error('Error in updateSale:', error);
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied.");
    }
    if (error.message === "Sale document not found.") {
      throw error;
    }
    throw new Error(error.message || "Firestore update failed.");
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

export const logExpense = async (data: Omit<Expense, 'id' | 'createdAt'> & { createdAt?: any }): Promise<string> => {
  try {
    const expenseId = doc(collection(db, EXPENSES_COLLECTION)).id;
    let timestamp = Timestamp.now();
    if (data.createdAt) {
      const selectedDate = toLocalDate(data.createdAt);
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      timestamp = Timestamp.fromDate(selectedDate);
    }

    const expensePayload = {
      ...data,
      id: expenseId,
      createdAt: timestamp
    };

    await setDoc(doc(db, EXPENSES_COLLECTION, expenseId), cleanUndefined(expensePayload));

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

export const updateExpense = async (
  expenseId: string, 
  updatedData: Omit<Expense, 'id' | 'createdAt'> & { createdAt?: any }
): Promise<void> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const expenseSnap = await getDoc(expenseRef);
    if (!expenseSnap.exists()) {
      throw new Error("Expense record not found");
    }
    const originalExpense = expenseSnap.data() as Expense;

    let timestamp = originalExpense.createdAt;
    if (updatedData.createdAt) {
      const selectedDate = toLocalDate(updatedData.createdAt);
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      timestamp = Timestamp.fromDate(selectedDate);
    }

    await setDoc(expenseRef, cleanUndefined({
      ...updatedData,
      id: expenseId,
      createdAt: timestamp
    }));
  } catch (error) {
    console.error('Error in updateExpense:', error);
    throw error;
  }
};

// --- PURCHASE ORDERS API ---
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const q = query(collection(db, PURCHASE_ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PurchaseOrder));
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
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));
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

export interface ParsedImportSale {
  date: string; // YYYY-MM-DD
  productName: string;
  productId?: string;
  quantity: number;
  price: number;
  discount: number;
  platform: 'Website' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'Jiji' | 'Walk-in' | 'Referral';
  notes?: string;
}

export const bulkImportSales = async (salesList: ParsedImportSale[]): Promise<{
  importedCount: number;
  revenue: number;
  profit: number;
  stockUpdatedCount: number;
}> => {
  try {
    const batch = writeBatch(db);
    let totalRevenue = 0;
    let totalProfit = 0;
    let stockUpdatedCount = 0;

    // Load all products to calculate costPrice / match ID if missing
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const productsMap = new Map<string, Product>();
    const productsByNameMap = new Map<string, Product>();

    productsSnap.forEach(d => {
      const p = { ...d.data(), id: d.id } as Product;
      productsMap.set(d.id, p);
      productsByNameMap.set(p.name.toLowerCase().trim(), p);
    });

    for (const item of salesList) {
      let productId = item.productId || '';
      let officialProductName = item.productName;
      let costPrice = 0;

      // Try matching by name if ID was not supplied or unmatched
      if (!productId) {
        const matched = productsByNameMap.get(item.productName.toLowerCase().trim());
        if (matched) {
          productId = matched.id;
          officialProductName = matched.name;
          costPrice = matched.costPrice || 0;
        }
      } else {
        const prod = productsMap.get(productId);
        if (prod) {
          officialProductName = prod.name;
          costPrice = prod.costPrice || 0;
        }
      }

      const saleId = doc(collection(db, SALES_COLLECTION)).id;
      const revenue = item.price * item.quantity;
      const profit = revenue - (costPrice * item.quantity) - item.discount;

      totalRevenue += revenue;
      totalProfit += profit;

      // Normalize date to Timestamp (with hours/minutes for ordering)
      const selectedDate = toLocalDate(item.date);
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const timestamp = Timestamp.fromDate(selectedDate);

      // 1. Queue sale document write
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      batch.set(saleRef, cleanUndefined({
        id: saleId,
        productId,
        productName: officialProductName,
        quantity: item.quantity,
        price: item.price,
        costPrice,
        profit,
        platform: item.platform,
        paymentMethod: 'MoMo', // default
        discount: item.discount,
        deliveryFee: 0,
        notes: item.notes || '',
        createdAt: timestamp
      }));

      // 2. Queue product stock update
      if (productId) {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        const prod = productsMap.get(productId);
        if (prod) {
          const currentStock = prod.currentStock !== undefined ? prod.currentStock : 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          // Update product map so subsequent sales in the same import reflect correct stock
          prod.currentStock = newStock;
          productsMap.set(productId, prod);

          batch.update(productRef, {
            currentStock: newStock,
            isOutOfStock: newStock <= 0,
            updatedAt: Timestamp.now()
          });
          stockUpdatedCount++;

          // 3. Queue inventory log write
          const logId = doc(collection(db, INVENTORY_LOGS_COLLECTION)).id;
          batch.set(doc(db, INVENTORY_LOGS_COLLECTION, logId), {
            id: logId,
            productId,
            productName: officialProductName,
            type: 'out',
            changeQty: item.quantity,
            newQty: newStock,
            reason: `Bulk Import Sale (ID: ${saleId})`,
            createdAt: timestamp
          });
        }
      }
    }

    await batch.commit();

    return {
      importedCount: salesList.length,
      revenue: totalRevenue,
      profit: totalProfit,
      stockUpdatedCount
    };
  } catch (error) {
    console.error("Error in bulkImportSales:", error);
    throw error;
  }
};

