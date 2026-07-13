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

export const updateSiteSettings = async (settingsData: SiteSettings): Promise<void> => {
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
