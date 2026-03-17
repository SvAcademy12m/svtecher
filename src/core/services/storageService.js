import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'cvs/userId_filename')
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

/**
 * Upload CV for a user
 * @param {string} userId
 * @param {File} file
 */
export const uploadCV = async (userId, file) => {
  const path = `cvs/${userId}_${Date.now()}_${file.name}`;
  return uploadFile(file, path);
};

/**
 * Upload a thumbnail image
 * @param {File} file
 * @param {string} folder - e.g., 'courses', 'posts'
 */
export const uploadImage = async (file, folder = 'images') => {
  const path = `${folder}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
};
