import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, count, getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

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
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

const getCount = async (colName, constraints = []) => {
  const q = query(collection(db, colName), ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

// ─── Domain Services ─────────────────────────
export const courseService = {
  create: (data) => addData('courses', data),
  update: (id, data) => updateData('courses', id, data),
  delete: (id) => deleteData('courses', id),
  getById: (id) => getById('courses', id),
  getAll: () => getAll('courses'),
  subscribe: (cb) => subscribeToCollection('courses', cb),
};

export const jobService = {
  create: (data) => addData('jobs', data),
  update: (id, data) => updateData('jobs', id, data),
  delete: (id) => deleteData('jobs', id),
  getById: (id) => getById('jobs', id),
  getAll: () => getAll('jobs'),
  subscribe: (cb) => subscribeToCollection('jobs', cb),
  getOpen: (cb) => subscribeToCollection('jobs', cb, [where('status', '==', 'open')]),
};

export const blogService = {
  create: (data) => addData('posts', data),
  update: (id, data) => updateData('posts', id, data),
  delete: (id) => deleteData('posts', id),
  getById: (id) => getById('posts', id),
  getAll: () => getAll('posts'),
  subscribe: (cb) => subscribeToCollection('posts', cb),
  getPublished: (cb) => subscribeToCollection('posts', cb, [where('status', '==', 'published')]),
};

export const applicationService = {
  create: (data) => addData('applications', data),
  getByUser: (uid, cb) => subscribeToCollection('applications', cb, [where('applicantId', '==', uid)]),
  subscribe: (cb) => subscribeToCollection('applications', cb),
};

export const userService = {
  getAll: (cb) => subscribeToCollection('users', cb),
  getById: (id) => getById('users', id),
  update: (id, data) => updateData('users', id, data),
  delete: (id) => deleteData('users', id),
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
  getActive: (cb) => subscribeToCollection('web_apps', cb, [where('status', '==', 'active')]),
};

export const notificationService = {
  getUnread: (uid, cb) => subscribeToCollection('notifications', cb, [
    where('userId', '==', uid),
    where('read', '==', false),
  ]),
  markRead: (id) => updateData('notifications', id, { read: true, readAt: new Date() }),
};
