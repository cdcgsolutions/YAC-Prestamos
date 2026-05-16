import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

export async function registrarUsuario(nombre, email, password, habilitado, idRol) {
    try {
        const usersRef = collection(db, "Usuarios");
        const qEmail = query(usersRef, where("CorreoElectronico", "==", email));
        const emailSnap = await getDocs(qEmail);
        
        if (!emailSnap.empty) {
            return { exito: false, mensaje: "Este correo electrónico ya está registrado." };
        }

        const qMaxId = query(usersRef, orderBy("Id", "desc"), limit(1));
        const maxIdSnap = await getDocs(qMaxId);
        
        let newId = 1;
        if (!maxIdSnap.empty) {
            newId = maxIdSnap.docs[0].data().Id + 1;
        }

        const newIdStr = newId.toString();
        const docRef = doc(db, "Usuarios", newIdStr);
        await setDoc(docRef, {
            Id: newId,
            NombreUsuario: nombre,
            CorreoElectronico: email,
            Contrasena: password,
            EstaHabilitado: habilitado,
            IdRol: idRol,
            FechaCreacion: new Date().toISOString()
        });

        return { exito: true, uid: newIdStr, mensaje: "Usuario creado exitosamente." };
    } catch (error) {
        return { exito: false, uid: null, mensaje: "Error al registrar: " + error.message };
    }
}

export async function obtenerRoles() {
    try {
        const rolesRef = collection(db, "Roles");
        const querySnapshot = await getDocs(rolesRef);
        
        let roles = [];
        querySnapshot.forEach((doc) => {
            roles.push({ idDocumento: doc.id, ...doc.data() });
        });
        
        return { exito: true, datos: roles, mensaje: "Roles cargados exitosamente." };
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al cargar roles: " + error.message };
    }
}

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

export async function obtenerUsuarios() {
    try {
        const usersRef = collection(db, "Usuarios");
        const querySnapshot = await getDocs(usersRef);
        
        let users = [];
        querySnapshot.forEach((doc) => {
            users.push({ idDocumento: doc.id, ...doc.data() });
        });
        
        return { exito: true, datos: users, mensaje: "Usuarios cargados exitosamente." };
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al cargar usuarios: " + error.message };
    }
}

export async function actualizarUsuario(idDocumento, nombre, email, password, habilitado, idRol) {
    try {
        const docRef = doc(db, "Usuarios", idDocumento);
        await setDoc(docRef, {
            Id: parseInt(idDocumento),
            NombreUsuario: nombre,
            CorreoElectronico: email,
            Contrasena: password,
            EstaHabilitado: habilitado,
            IdRol: idRol
        }, { merge: true });

        return { exito: true, mensaje: "Usuario actualizado correctamente." };
    } catch (error) {
        return { exito: false, mensaje: "Error al actualizar: " + error.message };
    }
}

export async function registrarCliente(nombre, fechaNacimiento, estadoCivil, direccion, celular, correo) {
    try {
        const clientesRef = collection(db, "Clientes");
        
        const qMaxId = query(clientesRef, orderBy("Id", "desc"), limit(1));
        const maxIdSnap = await getDocs(qMaxId);
        
        let newId = 1;
        if (!maxIdSnap.empty) {
            newId = maxIdSnap.docs[0].data().Id + 1;
        }

        const newIdStr = newId.toString();
        const docRef = doc(db, "Clientes", newIdStr);
        await setDoc(docRef, {
            Id: newId,
            Nombre: nombre,
            FechaNacimiento: fechaNacimiento,
            EstadoCivil: estadoCivil,
            Direccion: direccion,
            Celular: celular,
            Correo: correo,
            FechaRegistro: new Date().toISOString(),
            EstaHabilitado: true
        });

        return { exito: true, uid: newIdStr, mensaje: "Cliente registrado exitosamente." };
    } catch (error) {
        return { exito: false, uid: null, mensaje: "Error al registrar cliente: " + error.message };
    }
}

export async function obtenerClientes() {
    try {
        const clientesRef = collection(db, "Clientes");
        const querySnapshot = await getDocs(clientesRef);
        
        let clientes = [];
        querySnapshot.forEach((doc) => {
            clientes.push({ idDocumento: doc.id, ...doc.data() });
        });
        
        return { exito: true, datos: clientes, mensaje: "Clientes cargados exitosamente." };
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al cargar clientes: " + error.message };
    }
}

export async function actualizarCliente(idDocumento, nombre, fechaNacimiento, estadoCivil, direccion, celular, correo, estaHabilitado) {
    try {
        const docRef = doc(db, "Clientes", idDocumento);
        await setDoc(docRef, {
            Id: parseInt(idDocumento),
            Nombre: nombre,
            FechaNacimiento: fechaNacimiento,
            EstadoCivil: estadoCivil,
            Direccion: direccion,
            Celular: celular,
            Correo: correo,
            EstaHabilitado: estaHabilitado
        }, { merge: true });

        return { exito: true, mensaje: "Cliente actualizado correctamente." };
    } catch (error) {
        return { exito: false, mensaje: "Error al actualizar cliente: " + error.message };
    }
}

export async function registrarPrestamo(idCliente, nombreCliente, monto, porcentajeInteres, montoTotal, saldoPendiente, modalidadCobro, estado) {
    try {
        const prestamosRef = collection(db, "Prestamos");
        
        const qMaxId = query(prestamosRef, orderBy("Id", "desc"), limit(1));
        const maxIdSnap = await getDocs(qMaxId);
        
        let newId = 1;
        if (!maxIdSnap.empty) {
            newId = maxIdSnap.docs[0].data().Id + 1;
        }

        const newIdStr = newId.toString();
        const docRef = doc(db, "Prestamos", newIdStr);
        await setDoc(docRef, {
            Id: newId,
            IdCliente: idCliente,
            NombreCliente: nombreCliente,
            Monto: monto,
            PorcentajeInteres: porcentajeInteres,
            MontoTotal: montoTotal,
            SaldoPendiente: saldoPendiente,
            ModalidadCobro: modalidadCobro,
            Estado: estado,
            FechaRegistro: new Date().toISOString()
        });

        return { exito: true, uid: newIdStr, mensaje: "Préstamo registrado exitosamente." };
    } catch (error) {
        return { exito: false, uid: null, mensaje: "Error al registrar préstamo: " + error.message };
    }
}

export async function obtenerPrestamos() {
    try {
        const prestamosRef = collection(db, "Prestamos");
        const querySnapshot = await getDocs(prestamosRef);
        
        let prestamos = [];
        querySnapshot.forEach((doc) => {
            prestamos.push({ idDocumento: doc.id, ...doc.data() });
        });
        
        return { exito: true, datos: prestamos, mensaje: "Préstamos cargados exitosamente." };
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al cargar préstamos: " + error.message };
    }
}

export async function actualizarPrestamo(idDocumento, idCliente, nombreCliente, monto, porcentajeInteres, montoTotal, saldoPendiente, modalidadCobro, estado) {
    try {
        const docRef = doc(db, "Prestamos", idDocumento);
        await setDoc(docRef, {
            Id: parseInt(idDocumento),
            IdCliente: idCliente,
            NombreCliente: nombreCliente,
            Monto: monto,
            PorcentajeInteres: porcentajeInteres,
            MontoTotal: montoTotal,
            SaldoPendiente: saldoPendiente,
            ModalidadCobro: modalidadCobro,
            Estado: estado
        }, { merge: true });

        return { exito: true, mensaje: "Préstamo actualizado correctamente." };
    } catch (error) {
        return { exito: false, mensaje: "Error al actualizar préstamo: " + error.message };
    }
}

export async function registrarPago(idPrestamo, montoAbonado) {
    try {
        const prestamoRef = doc(db, "Prestamos", idPrestamo);
        const prestamoSnap = await getDoc(prestamoRef);

        if (!prestamoSnap.exists()) {
            return { exito: false, mensaje: "El préstamo no existe." };
        }

        const prestamoData = prestamoSnap.data();
        let nuevoSaldo = prestamoData.SaldoPendiente - montoAbonado;
        if (nuevoSaldo < 0) nuevoSaldo = 0;
        
        let nuevoEstado = prestamoData.Estado;
        if (nuevoSaldo === 0) {
            nuevoEstado = "Pagado";
        }

        // Actualizar Préstamo
        await setDoc(prestamoRef, {
            SaldoPendiente: nuevoSaldo,
            Estado: nuevoEstado
        }, { merge: true });

        // Registrar Pago
        const pagosRef = collection(db, "Pagos");
        const qMaxId = query(pagosRef, orderBy("Id", "desc"), limit(1));
        const maxIdSnap = await getDocs(qMaxId);
        
        let newId = 1;
        if (!maxIdSnap.empty) {
            newId = maxIdSnap.docs[0].data().Id + 1;
        }

        const newIdStr = newId.toString();
        const docPagoRef = doc(db, "Pagos", newIdStr);
        await setDoc(docPagoRef, {
            Id: newId,
            IdPrestamo: idPrestamo,
            MontoAbonado: montoAbonado,
            FechaPago: new Date().toISOString()
        });

        return { exito: true, mensaje: "Pago registrado exitosamente." };
    } catch (error) {
        return { exito: false, mensaje: "Error al registrar el pago: " + error.message };
    }
}

export async function obtenerPagosPorPrestamo(idPrestamo) {
    try {
        const pagosRef = collection(db, "Pagos");
        const q = query(pagosRef, where("IdPrestamo", "==", idPrestamo));
        const querySnapshot = await getDocs(q);
        
        let pagos = [];
        querySnapshot.forEach((doc) => {
            pagos.push({ idDocumento: doc.id, ...doc.data() });
        });
        
        return { exito: true, datos: pagos, mensaje: "Pagos cargados exitosamente." };
    } catch (error) {
        return { exito: false, datos: null, mensaje: "Error al cargar pagos: " + error.message };
    }
}
