export const firebaseConfig = {
  apiKey: "AIzaSyDQpTHydaOCmHDk-lafVnWN5UTRqusWJiw",
  authDomain: "practicum2-c2164.firebaseapp.com",
  projectId: "practicum2-c2164",
  storageBucket: "practicum2-c2164.firebasestorage.app",
  messagingSenderId: "254105894523",
  appId: "1:254105894523:web:4500ba208fcd40872c2cde",
  measurementId: "G-71KSM2QYQ1"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && !value.startsWith("PASTE_")
);
