import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, serverTimestamp, increment, updateDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
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

/** Generate a unique referral code */
const generateReferralCode = (name) => {
  const prefix = (name || 'USER').split(' ')[0].toUpperCase().slice(0, 4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SV-${prefix}-${random}`;
};

/** Determine Networking Role based on referrals */
export const getNetworkingRole = (count) => {
  if (count >= 101) return { title: 'Ambassador', color: 'text-purple-500', bg: 'bg-purple-500/10' };
  if (count >= 51) return { title: 'Director', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  if (count >= 21) return { title: 'Leader', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (count >= 6) return { title: 'Builder', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  return { title: 'Starter', color: 'text-blue-500', bg: 'bg-blue-500/10' };
};

/** Auto-follow: new user ↔ SVTech admin become mutual followers */
const autoFollowSVTech = async (newUserId) => {
  try {
    // Find the SVTech admin account
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminSnap = await getDocs(adminQuery);
    if (adminSnap.empty) return;

    const adminDoc = adminSnap.docs[0];
    const adminId = adminDoc.id;

    // New user follows admin
    await updateDoc(doc(db, 'users', newUserId), {
      following: arrayUnion(adminId),
      followingCount: increment(1),
    });

    // Admin follows new user back
    await updateDoc(doc(db, 'users', adminId), {
      followers: arrayUnion(newUserId),
      followersCount: increment(1),
      following: arrayUnion(newUserId),
      followingCount: increment(1),
    });
  } catch (err) {
    console.error('Auto-follow SVTech failed:', err);
  }
};

/** Register new user with role and referral handling */
export const registerUser = async (email, password, userData, referredBy = null) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (userData.name) {
      await updateProfile(user, { displayName: userData.name });
    }

    const referralCode = generateReferralCode(userData.name);

    const isSystemReferral = referredBy === 'svtecher.com' || referredBy === 'svtech.com';
    const initialEarnings = 20; // 20 ETB signup bonus

    // Initialize user with stats
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: userData.name || '',
      role: userData.role || 'customer',
      status: 'active',
      referralCode,
      referralsCount: 0,
      followersCount: 1,
      followingCount: 1,
      followers: [],
      following: [],
      earnings: initialEarnings,
      walletBalance: initialEarnings,
      subscriptionEarnings: 0,
      clickEarnings: 0,
      location: userData.location || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(userData.skills && { skills: userData.skills }),
      ...(userData.phone && { phone: userData.phone }),
      ...(referredBy && { referredBy, signupCode: referredBy }),
    });

    // Auto-follow: new user follows SVTech, SVTech follows new user
    await autoFollowSVTech(user.uid);

    // Handle referral tracking
    if (referredBy && !isSystemReferral) {
      try {
        const referrerRef = doc(db, 'users', referredBy);
        const referrerSnap = await getDoc(referrerRef);
        
        if (referrerSnap.exists()) {
          const referrerData = referrerSnap.data();
          
          await updateDoc(referrerRef, {
            referralsCount: increment(1),
            earnings: increment(20),
            walletBalance: increment(20),
            followers: arrayUnion(user.uid),
            followersCount: increment(1),
            updatedAt: serverTimestamp()
          });

          // New user follows referrer
          await updateDoc(doc(db, 'users', user.uid), {
            following: arrayUnion(referredBy),
            followingCount: increment(1)
          });

          // Record transactions
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            userName: userData.name || 'New User',
            amount: 20,
            type: 'referral_bonus',
            description: 'Signup bonus via referral',
            status: 'completed',
            createdAt: serverTimestamp(),
          });

          await addDoc(collection(db, 'transactions'), {
            userId: referredBy,
            userName: referrerData.name || 'Referrer',
            amount: 20,
            type: 'referral_reward',
            description: `Reward for referring ${userData.name || 'a new user'}`,
            status: 'completed',
            createdAt: serverTimestamp(),
          });

          // Log in referrals collection for Admin Console
          await addDoc(collection(db, 'referrals'), {
            referrerUid: referredBy,
            referredUid: user.uid,
            referredName: userData.name || 'New User',
            amount: 20,
            status: 'completed',
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Referrer update failed:", err);
      }
    }

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

/** Social auth (Google/Facebook) with referral handling */
export const socialLogin = async (providerType = 'google', referredBy = null) => {
  const provider = providerType === 'google' ? googleProvider : facebookProvider;
  const { user } = await signInWithPopup(auth, provider);

  // Check if user doc exists, create if first time
  const existing = await getUserData(user.uid);
  if (!existing) {
    const referralCode = generateReferralCode(user.displayName);
    const isSystemReferral = referredBy === 'svtecher.com' || referredBy === 'svtech.com';
    const initialEarnings = 20; // 20 ETB signup bonus
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      role: 'customer',
      status: 'active',
      referralCode,
      referralsCount: 0,
      followersCount: 1,
      followingCount: 1,
      followers: [],
      following: [],
      earnings: initialEarnings,
      walletBalance: initialEarnings,
      subscriptionEarnings: 0,
      clickEarnings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(referredBy && { referredBy, signupCode: referredBy }),
    });

    // Auto-follow SVTech
    await autoFollowSVTech(user.uid);

    if (referredBy && !isSystemReferral) {
      try {
        const referrerRef = doc(db, 'users', referredBy);
        const referrerSnap = await getDoc(referrerRef);
        
        if (referrerSnap.exists()) {
          const referrerData = referrerSnap.data();
          
          await updateDoc(referrerRef, {
            referralsCount: increment(1),
            earnings: increment(20),
            walletBalance: increment(20),
            followers: arrayUnion(user.uid),
            followersCount: increment(1),
            updatedAt: serverTimestamp()
          });

          // New user follows referrer
          await updateDoc(doc(db, 'users', user.uid), {
            following: arrayUnion(referredBy),
            followingCount: increment(1)
          });

          // Record transactions
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            userName: user.displayName || 'New User',
            amount: 20,
            type: 'referral_bonus',
            description: 'Social signup bonus via referral',
            status: 'completed',
            createdAt: serverTimestamp(),
          });

          await addDoc(collection(db, 'transactions'), {
            userId: referredBy,
            userName: referrerData.name || 'Referrer',
            amount: 20,
            type: 'referral_reward',
            description: `Reward for referring ${user.displayName || 'a new user'}`,
            status: 'completed',
            createdAt: serverTimestamp(),
          });

          // Log in referrals collection for Admin Console
          await addDoc(collection(db, 'referrals'), {
            referrerUid: referredBy,
            referredUid: user.uid,
            referredName: user.displayName || 'New User',
            amount: 20,
            status: 'completed',
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Referrer update failed (Social):", err);
      }
    }
  }
  return user;
};

/** Update user earnings */
export const incrementEarnings = async (uid, amount, type = 'earnings') => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [type]: increment(amount),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating earnings:', error);
    throw error;
  }
};

/** Reset Password */
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

/** Parse Firebase Auth Errors */
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection or disable ad-blockers.';
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use stronger characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    default:
      return error.message || 'An unexpected authentication error occurred.';
  }
};

/** Auth state listener */
export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback);
