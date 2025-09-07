// This file now configures and exports the Firebase client.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcTa1Zv4MZ6RY3NJW49R_0FLBBuqumCTc",
  authDomain: "genshin-codes-624d9.firebaseapp.com",
  databaseURL: "https://genshin-codes-624d9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "genshin-codes-624d9",
  storageBucket: "genshin-codes-624d9.appspot.com",
  messagingSenderId: "603396633606",
  appId: "1:603396633606:web:7f9ac26e7071fe3683ff87",
  measurementId: "G-0R33HW5GYC"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Firebase Realtime Database.
// The `db` export name is kept for minimal changes in other files.
export const db = getDatabase(app);