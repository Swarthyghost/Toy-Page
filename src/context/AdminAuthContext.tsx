import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

const ADMIN_CREDENTIALS = {
  'charlesnnamdiudeagwu@gmail.com': '123456',
  'admin@pleasuretoys.com': 'admin1',
  // Add more admin credentials here
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user is admin
        const emailToCheck = (user.email || '').trim().toLowerCase();
        if (ADMIN_CREDENTIALS[emailToCheck]) {
          const adminData: AdminUser = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || user.email!.split('@')[0],
            isAdmin: true,
          };

          // Save to Firestore for tracking
          const userDoc = doc(db, 'admins', user.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (!userSnapshot.exists()) {
            await setDoc(userDoc, {
              ...adminData,
              lastLogin: new Date(),
            });
          } else {
            await setDoc(userDoc, {
              ...userSnapshot.data(),
              lastLogin: new Date(),
            }, { merge: true });
          }

          setAdminUser(adminData);
        } else {
          await signOut(auth);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pin: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPin = pin.trim();

    console.log('signInWithEmail called with:', { normalizedEmail, normalizedPin });
    console.log('Checking ADMIN_CREDENTIALS:', ADMIN_CREDENTIALS);
    console.log('Email exists in credentials:', normalizedEmail in ADMIN_CREDENTIALS);
    console.log('PIN matches:', ADMIN_CREDENTIALS[normalizedEmail] === normalizedPin);
    
    // Check credentials first
    if (!ADMIN_CREDENTIALS[normalizedEmail] || ADMIN_CREDENTIALS[normalizedEmail] !== normalizedPin) {
      console.log('Credential check failed');
      throw new Error('Invalid credentials');
    }

    console.log('Credential check passed, proceeding with Firebase Auth');
    
    try {
      // Try to sign in with Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, pin);
        console.log('User signed in:', userCredential.user.uid);
      } catch (error: any) {
        console.log('Firebase sign-in error:', error);
        // If user doesn't exist, create them
        if (error.code === 'auth/user-not-found') {
          console.log('Creating new user...');
          userCredential = await createUserWithEmailAndPassword(auth, email, pin);
          console.log('User created:', userCredential.user.uid);
        } else {
          console.log('Other Firebase error:', error);
          throw error;
        }
      }

      // Ensure user is added to admins collection
      const userDoc = doc(db, 'admins', userCredential.user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (!userSnapshot.exists()) {
        console.log('Adding user to admins collection...');
        await setDoc(userDoc, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email!.split('@')[0],
          isAdmin: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        console.log('User added to admins collection');
      } else {
        console.log('Updating last login...');
        await setDoc(userDoc, {
          ...userSnapshot.data(),
          lastLogin: new Date(),
        }, { merge: true });
        console.log('Last login updated');
      }
    } catch (error) {
      console.error('Firebase auth error:', error);
      throw new Error('Authentication failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AdminAuthContextType = {
    adminUser,
    loading,
    signInWithEmail,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
