import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export const ConfiguracionFirebase = {
  apiKey: "AIzaSyDaP_TgQiyR7EQFS2zVvSnumASUaNaP5SQ",
  authDomain: "yac-prestamos.firebaseapp.com",
  projectId: "yac-prestamos",
  storageBucket: "yac-prestamos.firebasestorage.app",
  messagingSenderId: "503456382134",
  appId: "1:503456382134:web:264a9820855f3fc44bfa17",
  measurementId: "G-SQ270FNEWK"
};

export const AppFirebase = initializeApp(ConfiguracionFirebase);
export const BaseDatosFirestore = getFirestore(AppFirebase);

export {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit
};
