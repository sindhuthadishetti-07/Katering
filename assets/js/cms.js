/**
 * KateringKing — CMS Core
 * Firestore + Storage + Auth helpers used by both the public site
 * (menu-renderer.js) and the admin panel (admin.js).
 *
 * All Firebase access goes through this module so credentials and
 * SDK imports are defined in exactly one place.
 */

import { firebaseConfig } from './firebase-config.js';

import { initializeApp }          from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged,
         sendPasswordResetEmail }  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc,
         getDocs, getDoc, addDoc, setDoc,
         updateDoc, deleteDoc, writeBatch,
         query, where, orderBy }   from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage, ref,
         uploadBytesResumable,
         getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// ─── Initialise ──────────────────────────────────────────────
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// ─── Collection names ─────────────────────────────────────────
export const COL = {
  ITEMS:      'menuItems',
  CATEGORIES: 'menuCategories',
  CONTENT:    'siteContent',
};

// ─── Schema version ───────────────────────────────────────────
export const SCHEMA_VERSION = 1;

// ─── Menu tab IDs (matches existing HTML data-tab values) ─────
export const TABS = {
  NONVEG:    'nonveg',
  VEG:       'veg',
  SIGNATURE: 'signature',
};

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════

/**
 * Sign in with email + password.
 * Returns the Firebase User object on success.
 * Throws a friendly Error on failure.
 */
export async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err) {
    throw new Error(_authMessage(err.code));
  }
}

export async function logout() {
  await signOut(auth);
}

/**
 * Send a password-reset email.
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw new Error(_authMessage(err.code));
  }
}

/**
 * Subscribe to auth state changes.
 * callback(user | null) — user is null when signed out.
 */
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Returns the currently signed-in user or null (synchronous snapshot).
 */
export function currentUser() {
  return auth.currentUser;
}

/**
 * Check whether the current user has the admin custom claim.
 * The custom claim { admin: true } must be set server-side via
 * scripts/set-admin-claim.js before the admin panel will work.
 */
export async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const token = await user.getIdTokenResult(/* forceRefresh */ true);
  return token.claims.admin === true;
}

function _authMessage(code) {
  const map = {
    'auth/user-not-found':   'No account found with that email address.',
    'auth/wrong-password':   'Incorrect password. Please try again.',
    'auth/invalid-email':    'The email address is not valid.',
    'auth/too-many-requests':'Too many failed attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Authentication failed. Please try again.';
}

// ══════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════

/**
 * Fetch all categories for a given menu tab, ordered by displayOrder.
 * Returns an array of { id, ...data } objects.
 */
export async function getCategories(tabId) {
  const q = query(
    collection(db, COL.CATEGORIES),
    where('menuTab', '==', tabId),
    orderBy('displayOrder', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new category.
 * Returns the new document ID.
 */
export async function addCategory(tabId, name, displayOrder = 999) {
  const ref = await addDoc(collection(db, COL.CATEGORIES), {
    menuTab:      tabId,
    name,
    displayOrder,
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
  });
  return ref.id;
}

export async function updateCategory(id, data) {
  await updateDoc(doc(db, COL.CATEGORIES, id), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, COL.CATEGORIES, id));
}

// ══════════════════════════════════════════════════════════════
// MENU ITEMS
// ══════════════════════════════════════════════════════════════

/**
 * Fetch all published items for a tab, ordered by displayOrder.
 * Public site uses this — draft items are excluded by Firestore rules.
 */
export async function getPublishedItems(tabId) {
  const q = query(
    collection(db, COL.ITEMS),
    where('menuTab',  '==', tabId),
    where('status',   '==', 'published'),
    orderBy('displayOrder', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch ALL items for a tab (admin only — includes drafts).
 */
export async function getAllItems(tabId) {
  const q = query(
    collection(db, COL.ITEMS),
    where('menuTab', '==', tabId),
    orderBy('displayOrder', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single item by ID.
 */
export async function getItem(id) {
  const snap = await getDoc(doc(db, COL.ITEMS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Create a new menu item.
 * Returns the new document ID.
 *
 * Item schema:
 * {
 *   menuTab:      string   — 'nonveg' | 'veg' | 'signature'
 *   categoryId:   string   — Firestore category doc ID
 *   categoryName: string   — denormalised for fast reads
 *   name:         string
 *   variant:      string   — optional e.g. "(Lamb Shanks)"
 *   description:  string
 *   imageUrl:     string   — Storage URL or external URL
 *   imagePath:    string   — Storage path for deletion (optional)
 *   price:        string   — optional display price
 *   displayOrder: number
 *   featured:     boolean
 *   status:       'published' | 'draft'
 *   courseId:     string   — for Signature Reserve courses (optional)
 *   courseName:   string
 *   courseOrder:  number
 *   createdAt:    number   — ms timestamp
 *   updatedAt:    number
 * }
 */
export async function addItem(data) {
  const ref = await addDoc(collection(db, COL.ITEMS), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateItem(id, data) {
  await updateDoc(doc(db, COL.ITEMS, id), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteItem(id) {
  await deleteDoc(doc(db, COL.ITEMS, id));
}

/**
 * Publish or unpublish an item.
 */
export async function setItemStatus(id, status) {
  await updateDoc(doc(db, COL.ITEMS, id), {
    status,
    updatedAt: Date.now(),
  });
}

/**
 * Batch-reorder items.
 * orderedIds: array of document IDs in the desired display order.
 */
export async function reorderItems(orderedIds) {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, COL.ITEMS, id), {
      displayOrder: index,
      updatedAt:    Date.now(),
    });
  });
  await batch.commit();
}

// ══════════════════════════════════════════════════════════════
// SITE CONTENT (About text, headings, etc.)
// ══════════════════════════════════════════════════════════════

export async function getSiteContent(docId) {
  const snap = await getDoc(doc(db, COL.CONTENT, docId));
  return snap.exists() ? snap.data() : null;
}

export async function setSiteContent(docId, data) {
  await setDoc(doc(db, COL.CONTENT, docId), {
    ...data,
    updatedAt: Date.now(),
  }, { merge: true });
}

// ══════════════════════════════════════════════════════════════
// STORAGE — Image upload with progress
// ══════════════════════════════════════════════════════════════

/**
 * Upload an image file to Firebase Storage.
 *
 * @param {File}     file          — the File object from <input type="file">
 * @param {string}   storagePath   — e.g. "dishes/signature/kareli-roast.jpg"
 * @param {Function} onProgress    — called with 0–100 percentage
 * @returns {Promise<{url: string, path: string}>}
 */
export function uploadImage(file, storagePath, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef  = ref(storage, storagePath);
    const uploadTask  = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(pct);
      },
      err => reject(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url, path: storagePath });
      }
    );
  });
}

/**
 * Delete an image from Firebase Storage by its storage path.
 * Silently ignores 'object-not-found' errors.
 */
export async function deleteImage(storagePath) {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    if (err.code !== 'storage/object-not-found') throw err;
  }
}

/**
 * Compress an image file in the browser before uploading.
 * Returns a compressed File object.
 *
 * @param {File}   file      — original File
 * @param {number} maxWidth  — max width in pixels (default 1200)
 * @param {number} quality   — JPEG quality 0–1 (default 0.82)
 * @returns {Promise<File>}
 */
export function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload  = e => {
      const img = new Image();
      img.onerror = () => reject(new Error('File is not a supported image.'));
      img.onload  = () => {
        try {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width  = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context unavailable.');
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            blob => {
              if (!blob) { reject(new Error('Compression failed.')); return; }
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            quality
          );
        } catch (err) { reject(err); }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ══════════════════════════════════════════════════════════════
// MIGRATION HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Check whether the seed migration has already run.
 * Reads a sentinel document in siteContent.
 */
export async function isMigrated() {
  const snap = await getDoc(doc(db, COL.CONTENT, '_migration'));
  if (!snap.exists()) return false;
  return snap.data().version >= SCHEMA_VERSION;
}

/**
 * Mark migration as complete.
 */
export async function markMigrated(counts) {
  await setDoc(doc(db, COL.CONTENT, '_migration'), {
    version:    SCHEMA_VERSION,
    migratedAt: Date.now(),
    counts,
  });
}

// ══════════════════════════════════════════════════════════════
// BACKUP / RESTORE
// ══════════════════════════════════════════════════════════════

/**
 * Export all CMS-managed content as a plain JS object (for JSON download).
 * Never includes auth credentials or storage private keys.
 */
export async function exportBackup() {
  const [cats, items, content] = await Promise.all([
    getDocs(collection(db, COL.CATEGORIES)),
    getDocs(collection(db, COL.ITEMS)),
    getDocs(collection(db, COL.CONTENT)),
  ]);
  return {
    _meta: {
      schemaVersion: SCHEMA_VERSION,
      exportedAt:    new Date().toISOString(),
      project:       'kateringking',
    },
    categories: cats.docs.map(d => ({ id: d.id, ...d.data() })),
    items:      items.docs.map(d => ({ id: d.id, ...d.data() })),
    content:    content.docs.map(d => ({ id: d.id, ...d.data() })),
  };
}

/**
 * Validate a backup object before restoring.
 * Returns { valid: boolean, errors: string[] }.
 */
export function validateBackup(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Invalid file — not a JSON object.');
    return { valid: false, errors };
  }
  if (!data._meta) errors.push('Missing _meta block.');
  if (!Array.isArray(data.categories)) errors.push('Missing categories array.');
  if (!Array.isArray(data.items))      errors.push('Missing items array.');
  if (data._meta && data._meta.schemaVersion > SCHEMA_VERSION) {
    errors.push(
      `Backup schema v${data._meta.schemaVersion} is newer than ` +
      `current v${SCHEMA_VERSION}. Update the site before restoring.`
    );
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Restore from a validated backup object.
 * Uses batched writes — does NOT delete auth users or Storage files.
 */
export async function restoreBackup(data) {
  const { valid, errors } = validateBackup(data);
  if (!valid) throw new Error(errors.join('\n'));

  // Restore categories
  for (const cat of data.categories) {
    const { id, ...fields } = cat;
    await setDoc(doc(db, COL.CATEGORIES, id), fields);
  }

  // Restore items
  for (const item of data.items) {
    const { id, ...fields } = item;
    await setDoc(doc(db, COL.ITEMS, id), fields);
  }

  // Restore site content (skip _migration sentinel)
  for (const c of (data.content || [])) {
    if (c.id === '_migration') continue;
    const { id, ...fields } = c;
    await setDoc(doc(db, COL.CONTENT, id), fields);
  }
}

export { db, auth, storage };
