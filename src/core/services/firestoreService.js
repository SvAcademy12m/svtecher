import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, getCountFromServer, setDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

// --- System Settings ---
export const systemService = {
  subscribe: (cb) => subscribeToCollection('settings', (docs) => cb(docs[0] || {})),
  update: async (data) => {
    const q = query(collection(db, 'settings'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return addDoc(collection(db, 'settings'), { ...data, updatedAt: serverTimestamp() });
    }
    return updateDoc(doc(db, 'settings', snap.docs[0].id), { ...data, updatedAt: serverTimestamp() });
  }
};

// --- About Content ---
export const aboutService = {
  get: () => getDoc(doc(db, 'content', 'about')),
  update: (data) => setDoc(doc(db, 'content', 'about'), { ...data, updatedAt: serverTimestamp() }),
  subscribe: (cb) => onSnapshot(doc(db, 'content', 'about'), (snap) => cb(snap.exists() ? snap.data() : null))
};

// --- Applications ---
export const applicationService = {
  add: (data) => addDoc(collection(db, 'applications'), { ...data, status: 'pending', createdAt: serverTimestamp() }),
  subscribe: (cb) => subscribeToCollection('applications', cb),
  update: (id, data) => updateDoc(doc(db, 'applications', id), { ...data, updatedAt: serverTimestamp() }),
  delete: (id) => deleteDoc(doc(db, 'applications', id)),
  getByUser: (uid, cb) => subscribeToCollection('applications', cb, [where('userId', '==', uid)]),
  getByJob: (jobId, cb) => subscribeToCollection('applications', cb, [where('jobId', '==', jobId)])
};

/** SVTECH FIRESTORE SERVICES - V6 REFRESH */

// ─── Generic CRUD ────────────────────────────
const addData = async (colName, data) =>
  addDoc(collection(db, colName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

const updateData = async (colName, id, data) =>
  updateDoc(doc(db, colName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

const deleteData = async (colName, id) =>
  deleteDoc(doc(db, colName, id));

const getById = async (colName, id) => {
  const snap = await getDoc(doc(db, colName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

const getAll = async (colName, orderField = 'createdAt', dir = 'desc') => {
  const q = query(collection(db, colName), orderBy(orderField, dir));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

const subscribeToCollection = (colName, callback, constraints = []) => {
  const q = query(collection(db, colName), ...constraints);
  return onSnapshot(
    q, 
    (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error(`Error subscribing to ${colName}:`, error);
      callback([]); // Failsafe: return empty array so UI doesn't hang spinning forever
    }
  );
};

const getCount = async (colName, constraints = []) => {
  const q = query(collection(db, colName), ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

// ─── Domain Services ─────────────────────────
// Note: We use in-memory filtering here to avoid requiring complex composite indexes on Firebase out-of-the-box.
export const courseService = {
  create: (data) => addData('courses', data),
  update: (id, data) => updateData('courses', id, data),
  delete: (id) => deleteData('courses', id),
  getById: (id) => getById('courses', id),
  getAll: () => getAll('courses'),
  subscribe: (cb) => subscribeToCollection('courses', cb),
  getOfficial: (cb) => subscribeToCollection('courses', (docs) => cb(docs.filter(d => d.isVerified === true))),
};

export const jobService = {
  create: (data) => addData('jobs', data),
  update: (id, data) => updateData('jobs', id, data),
  delete: (id) => deleteData('jobs', id),
  getById: (id) => getById('jobs', id),
  getAll: () => getAll('jobs'),
  subscribe: (cb) => subscribeToCollection('jobs', cb),
  getOpen: (cb) => subscribeToCollection('jobs', (docs) => cb(docs.filter(d => d.status === 'open'))),
  getOfficial: (cb) => subscribeToCollection('jobs', (docs) => cb(docs.filter(d => d.isVerified === true && d.status === 'open'))),
};

export const blogService = {
  create: (data) => addData('posts', data),
  update: (id, data) => updateData('posts', id, data),
  delete: (id) => deleteData('posts', id),
  getById: (id) => getById('posts', id),
  getAll: () => getAll('posts'),
  subscribe: (cb) => subscribeToCollection('posts', cb),
  getPublished: (cb) => subscribeToCollection('posts', (docs) => cb(docs.filter(d => d.status === 'published'))),
};

// applicationService removed - using enhanced version at top

const users_subscribe = (cb) => subscribeToCollection('users', cb);
const users_getAll = (cb) => subscribeToCollection('users', cb);

export const userService = {
  subscribe: users_subscribe,
  getAll: users_getAll,
  getById: (id) => getById('users', id),
  update: (id, data) => updateData('users', id, data),
  'delete': (id) => deleteData('users', id),
  getCountByRole: (role) => getCount('users', [where('role', '==', role)]),
  getTotalCount: () => getCount('users'),
};

export const webAppService = {
  create: (data) => addData('web_apps', data),
  update: (id, data) => updateData('web_apps', id, data),
  delete: (id) => deleteData('web_apps', id),
  getById: (id) => getById('web_apps', id),
  getAll: () => getAll('web_apps'),
  subscribe: (cb) => subscribeToCollection('web_apps', cb),
  getActive: (cb) => subscribeToCollection('web_apps', (docs) => cb(docs.filter(d => d.status === 'active'))),
};

export const notificationService = {
  getUnread: (uid, cb) => subscribeToCollection('notifications', (docs) => cb(docs.filter(d => d.userId === uid && d.read === false))),
  markRead: (id) => updateData('notifications', id, { read: true, readAt: new Date() }),
};
