export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  projectId: "practicum2-c2164",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID",
  measurementId: "PASTE_MEASUREMENT_ID"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && !value.startsWith("PASTE_")
);
