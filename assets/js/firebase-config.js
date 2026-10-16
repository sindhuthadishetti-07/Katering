/**
 * KateringKing — Firebase Configuration
 *
 * NOTE: It is safe and intentional for this config to be in source
 * control. Firebase frontend API keys identify the project but do
 * NOT grant any data access. All data access is controlled by
 * Firestore Security Rules and Firebase Authentication.
 *
 * See: https://firebase.google.com/docs/projects/api-keys
 */

export const firebaseConfig = {
  apiKey:            "AIzaSyCW9o469LYlMnCyBRw3CDXaCHW1kBXnSh4",
  authDomain:        "kateringking.firebaseapp.com",
  projectId:         "kateringking",
  storageBucket:     "kateringking.firebasestorage.app",
  messagingSenderId: "128658008790",
  appId:             "1:128658008790:web:57e2a501f00b634f573777"
};

// Firebase CDN version pinned for stability
export const FB_VERSION = "10.12.2";

export const FB_CDN = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
