import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../firebase/firebase';

/** Get user data from Firestore by UID */
export const getUserData = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/** Register new user with role */
export const registerUser = async (email, password, userData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (userData.name) {
      await updateProfile(user, { displayName: userData.name });
    }

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: userData.name || '',
      role: userData.role || 'customer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(userData.skills && { skills: userData.skills }),
      ...(userData.phone && { phone: userData.phone }),
    });

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/** Login user */
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/** Logout */
export const logoutUser = () => signOut(auth);

/** Social auth (Google/Facebook) */
export const socialLogin = async (providerType = 'google') => {
  const provider = providerType === 'google' ? googleProvider : facebookProvider;
  const { user } = await signInWithPopup(auth, provider);

  // Check if user doc exists, create if first time
  const existing = await getUserData(user.uid);
  if (!existing) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      role: 'customer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return user;
};

/** Auth state listener */
export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback);
