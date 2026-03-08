import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Product {
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

async function migrateProducts() {
  try {
    // Read existing products from JSON file
    const productsData = readFileSync(join(__dirname, '../../data/products.json'), 'utf8');
    const products: Product[] = JSON.parse(productsData);

    console.log(`Starting migration of ${products.length} products...`);

    for (const product of products) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`Migrated product: ${product.name} (ID: ${docRef.id})`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateProducts();
