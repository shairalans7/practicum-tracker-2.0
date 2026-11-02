export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID",
  measurementId: "PASTE_MEASUREMENT_ID"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && !value.startsWith("PASTE_")
);
