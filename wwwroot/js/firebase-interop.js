import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaP_TgQiyR7EQFS2zVvSnumASUaNaP5SQ",
  authDomain: "yac-prestamos.firebaseapp.com",
  projectId: "yac-prestamos",
  storageBucket: "yac-prestamos.firebasestorage.app",
  messagingSenderId: "503456382134",
  appId: "1:503456382134:web:264a9820855f3fc44bfa17",
  measurementId: "G-SQ270FNEWK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Función para iniciar sesión buscando en Firestore
export async function loginWithEmail(email, password) {
    try {
        const usersRef = collection(db, "Usuarios");
        const q = query(usersRef, where("CorreoElectronico", "==", email), where("Contrasena", "==", password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exito: false, uid: null, mensaje: "Correo o contraseña incorrectos." };
        }

        let userDoc = null;
        querySnapshot.forEach((doc) => {
            userDoc = { id: doc.id, ...doc.data() };
        });

        if (!userDoc.EstaHabilitado) {
            return { exito: false, uid: null, mensaje: "El usuario está deshabilitado por un administrador." };
        }

        return { exito: true, uid: userDoc.id, mensaje: "Inicio de sesión exitoso." };
    } catch (error) {
        return { exito: false, uid: null, mensaje: "Error en la base de datos: " + error.message };
    }
}

// Función para registrar un nuevo usuario en Firestore
export async function registrarUsuario(nombre, email, password, habilitado) {
    try {
        // Verificar si el correo ya existe
        const usersRef = collection(db, "Usuarios");
        const q = query(usersRef, where("CorreoElectronico", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return { exito: false, mensaje: "Este correo electrónico ya está registrado." };
        }

        // Insertar nuevo documento
        const docRef = await addDoc(usersRef, {
            NombreUsuario: nombre,
            CorreoElectronico: email,
            Contrasena: password,
            EstaHabilitado: habilitado,
            FechaCreacion: new Date().toISOString()
        });

        return { exito: true, uid: docRef.id, mensaje: "Usuario creado exitosamente." };
    } catch (error) {
        return { exito: false, uid: null, mensaje: "Error al registrar: " + error.message };
    }
}

// Función para obtener los datos de un usuario por su UID
export async function obtenerUsuario(uid) {
    try {
        const userRef = doc(db, "Usuarios", uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return { exito: true, datos: { id: docSnap.id, ...docSnap.data() }, mensaje: "Usuario encontrado" };
        } else {
            return { exito: false, datos: null, mensaje: "No se encontró el usuario." };
        }
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al buscar: " + error.message };
    }
}
