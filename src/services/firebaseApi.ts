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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
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

const PRODUCTS_COLLECTION = 'products';
const PROMOS_COLLECTION = 'promoCodes';

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
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

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File): Promise<string> => {
  let imageUrl = productData.image;
  
  try {
    // Upload image if file is provided
    if (imageFile) {
      console.log('Uploading image:', imageFile.name);
      imageUrl = await uploadImage(imageFile);
      console.log('Image uploaded successfully:', imageUrl);
    }

    const product = {
      ...productData,
      image: imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating product with data:', product);
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
    console.log('Product created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>, imageFile?: File): Promise<void> => {
  let imageUrl = productData.image;
  
  // Upload image if file is provided
  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  const updates = {
    ...productData,
    ...(imageUrl && { image: imageUrl }),
    updatedAt: Timestamp.now(),
  };

  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, updates);
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
