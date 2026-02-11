// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isMerchant: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isMerchant: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ 
            uid: firebaseUser.uid, 
            ...userDoc.data() 
          } as User);
        } else {
          // Usuario nuevo (primer login con Google)
          // Se creará como merchant por defecto
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // Verificar si es admin por email
      const isAdminEmail = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      // Crear nuevo usuario en Firestore
      const newUser = {
        email: firebaseUser.email || '',
        role: isAdminEmail ? 'admin' : 'merchant' as UserRole,
        displayName: firebaseUser.displayName || '',
        active: true,
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser({ uid: firebaseUser.uid, ...newUser });
    } else {
      setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    displayName?: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: Omit<User, 'uid'> = {
      email,
      role,
      displayName: displayName || '',
      active: true,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        firebaseUser, 
        loading, 
        signIn,
        signInWithGoogle,
        signUp, 
        signOut, 
        isAdmin, 
        isMerchant 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);