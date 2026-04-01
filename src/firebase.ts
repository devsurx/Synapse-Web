import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQ3Q6LQ5MqJZu6WnCSkFhRPKMekWfdhVE",
  authDomain: "synapse-web-c22c2.firebaseapp.com",
  projectId: "synapse-web-c22c2",
  storageBucket: "synapse-web-c22c2.firebasestorage.app",
  messagingSenderId: "990375924842",
  appId: "1:990375924842:web:5b4cb1e3ed2edad6f06613",
  measurementId: "G-2QKCC7LDVW"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);