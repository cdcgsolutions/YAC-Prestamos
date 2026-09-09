import {
  BaseDatosFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit
} from "./ConfiguracionFirebase.js";

export class ServicioFirebase {
  
  // =========================================================
  // AUTENTICACIÓN Y USUARIOS
  // =========================================================
  
  static async AutenticarUsuario(Correo, Contrasena) {
    try {
      const ColeccionUsuarios = collection(BaseDatosFirestore, "Usuarios");
      const Consulta = query(
        ColeccionUsuarios,
        where("CorreoElectronico", "==", Correo.trim()),
        where("Contrasena", "==", Contrasena)
      );
      const DocumentosSnap = await getDocs(Consulta);

      if (DocumentosSnap.empty) {
        return { Exito: false, Uid: null, Mensaje: "Correo o contraseña incorrectos." };
      }

      let DatosUsuario = null;
      DocumentosSnap.forEach((Doc) => {
        DatosUsuario = { IdDocumento: Doc.id, ...Doc.data() };
      });

      if (!DatosUsuario.EstaHabilitado) {
        return { Exito: false, Uid: null, Mensaje: "El usuario está deshabilitado por un administrador." };
      }

      return { Exito: true, Uid: DatosUsuario.IdDocumento, Datos: DatosUsuario, Mensaje: "Inicio de sesión exitoso." };
    } catch (Error) {
      return { Exito: false, Uid: null, Mensaje: "Error en la base de datos: " + Error.message };
    }
  }

  static async ObtenerUsuarioPorId(Uid) {
    try {
      const ReferenciaDoc = doc(BaseDatosFirestore, "Usuarios", Uid);
      const DocSnap = await getDoc(ReferenciaDoc);

      if (DocSnap.exists()) {
        return { Exito: true, Datos: { IdDocumento: DocSnap.id, ...DocSnap.data() }, Mensaje: "Usuario encontrado" };
      } else {
        return { Exito: false, Datos: null, Mensaje: "No se encontró el usuario." };
      }
    } catch (Error) {
      return { Exito: false, Datos: null, Mensaje: "Error al buscar usuario: " + Error.message };
    }
  }

  static async ObtenerUsuarios() {
    try {
      const ColeccionUsuarios = collection(BaseDatosFirestore, "Usuarios");
      const DocumentosSnap = await getDocs(ColeccionUsuarios);
      
      let ListaUsuarios = [];
      DocumentosSnap.forEach((Doc) => {
        ListaUsuarios.push({ IdDocumento: Doc.id, ...Doc.data() });
      });

      ListaUsuarios.sort((A, B) => (A.Id || 0) - (B.Id || 0));
      return { Exito: true, Datos: ListaUsuarios, Mensaje: "Usuarios cargados exitosamente." };
    } catch (Error) {
      return { Exito: false, Datos: [], Mensaje: "Error al cargar usuarios: " + Error.message };
    }
  }

  static async RegistrarUsuario(Nombre, Correo, Contrasena, EstaHabilitado, IdRol) {
    try {
      const ColeccionUsuarios = collection(BaseDatosFirestore, "Usuarios");
      const ConsultaCorreo = query(ColeccionUsuarios, where("CorreoElectronico", "==", Correo.trim()));
      const CorreoSnap = await getDocs(ConsultaCorreo);

      if (!CorreoSnap.empty) {
        return { Exito: false, Mensaje: "Este correo electrónico ya está registrado." };
      }

      const ConsultaMaxId = query(ColeccionUsuarios, orderBy("Id", "desc"), limit(1));
      const MaxIdSnap = await getDocs(ConsultaMaxId);

      let NuevoId = 1;
      if (!MaxIdSnap.empty) {
        NuevoId = (MaxIdSnap.docs[0].data().Id || 0) + 1;
      }

      const NuevoIdTexto = NuevoId.toString();
      const ReferenciaDoc = doc(BaseDatosFirestore, "Usuarios", NuevoIdTexto);
      
      await setDoc(ReferenciaDoc, {
        Id: NuevoId,
        NombreUsuario: Nombre.trim(),
        CorreoElectronico: Correo.trim(),
        Contrasena: Contrasena,
        EstaHabilitado: Boolean(EstaHabilitado),
        IdRol: Number(IdRol),
        FechaCreacion: new Date().toISOString()
      });

      return { Exito: true, Uid: NuevoIdTexto, Mensaje: "Usuario creado exitosamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al registrar usuario: " + Error.message };
    }
  }

  static async ActualizarUsuario(IdDocumento, Nombre, Correo, Contrasena, EstaHabilitado, IdRol) {
    try {
      const ReferenciaDoc = doc(BaseDatosFirestore, "Usuarios", IdDocumento);
      await setDoc(ReferenciaDoc, {
        Id: parseInt(IdDocumento) || 0,
        NombreUsuario: Nombre.trim(),
        CorreoElectronico: Correo.trim(),
        Contrasena: Contrasena,
        EstaHabilitado: Boolean(EstaHabilitado),
        IdRol: Number(IdRol)
      }, { merge: true });

      return { Exito: true, Mensaje: "Usuario actualizado correctamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al actualizar usuario: " + Error.message };
    }
  }

  static async ObtenerRoles() {
    try {
      const ColeccionRoles = collection(BaseDatosFirestore, "Roles");
      const DocumentosSnap = await getDocs(ColeccionRoles);

      let ListaRoles = [];
      DocumentosSnap.forEach((Doc) => {
        ListaRoles.push({ IdDocumento: Doc.id, ...Doc.data() });
      });

      return { Exito: true, Datos: ListaRoles, Mensaje: "Roles cargados exitosamente." };
    } catch (Error) {
      return { Exito: false, Datos: [], Mensaje: "Error al cargar roles: " + Error.message };
    }
  }

  // =========================================================
  // GESTIÓN DE CLIENTES
  // =========================================================

  static async ObtenerClientes() {
    try {
      const ColeccionClientes = collection(BaseDatosFirestore, "Clientes");
      const DocumentosSnap = await getDocs(ColeccionClientes);

      let ListaClientes = [];
      DocumentosSnap.forEach((Doc) => {
        ListaClientes.push({ IdDocumento: Doc.id, ...Doc.data() });
      });

      ListaClientes.sort((A, B) => (A.Id || 0) - (B.Id || 0));
      return { Exito: true, Datos: ListaClientes, Mensaje: "Clientes cargados exitosamente." };
    } catch (Error) {
      return { Exito: false, Datos: [], Mensaje: "Error al cargar clientes: " + Error.message };
    }
  }

  static async RegistrarCliente(Nombre, FechaNacimiento, EstadoCivil, Direccion, Celular, Correo) {
    try {
      const ColeccionClientes = collection(BaseDatosFirestore, "Clientes");
      const ConsultaMaxId = query(ColeccionClientes, orderBy("Id", "desc"), limit(1));
      const MaxIdSnap = await getDocs(ConsultaMaxId);

      let NuevoId = 1;
      if (!MaxIdSnap.empty) {
        NuevoId = (MaxIdSnap.docs[0].data().Id || 0) + 1;
      }

      const NuevoIdTexto = NuevoId.toString();
      const ReferenciaDoc = doc(BaseDatosFirestore, "Clientes", NuevoIdTexto);

      await setDoc(ReferenciaDoc, {
        Id: NuevoId,
        Nombre: Nombre.trim(),
        FechaNacimiento: FechaNacimiento || null,
        EstadoCivil: EstadoCivil,
        Direccion: Direccion ? Direccion.trim() : "",
        Celular: Celular.trim(),
        Correo: Correo ? Correo.trim() : "",
        FechaRegistro: new Date().toISOString(),
        EstaHabilitado: true
      });

      return { Exito: true, Uid: NuevoIdTexto, Mensaje: "Cliente registrado exitosamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al registrar cliente: " + Error.message };
    }
  }

  static async ActualizarCliente(IdDocumento, Nombre, FechaNacimiento, EstadoCivil, Direccion, Celular, Correo, EstaHabilitado) {
    try {
      const ReferenciaDoc = doc(BaseDatosFirestore, "Clientes", IdDocumento);
      await setDoc(ReferenciaDoc, {
        Id: parseInt(IdDocumento) || 0,
        Nombre: Nombre.trim(),
        FechaNacimiento: FechaNacimiento || null,
        EstadoCivil: EstadoCivil,
        Direccion: Direccion ? Direccion.trim() : "",
        Celular: Celular.trim(),
        Correo: Correo ? Correo.trim() : "",
        EstaHabilitado: Boolean(EstaHabilitado)
      }, { merge: true });

      return { Exito: true, Mensaje: "Cliente actualizado correctamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al actualizar cliente: " + Error.message };
    }
  }

  // =========================================================
  // GESTIÓN DE PRÉSTAMOS
  // =========================================================

  static async ObtenerPrestamos() {
    try {
      const ColeccionPrestamos = collection(BaseDatosFirestore, "Prestamos");
      const DocumentosSnap = await getDocs(ColeccionPrestamos);

      let ListaPrestamos = [];
      DocumentosSnap.forEach((Doc) => {
        ListaPrestamos.push({ IdDocumento: Doc.id, ...Doc.data() });
      });

      ListaPrestamos.sort((A, B) => (B.Id || 0) - (A.Id || 0));
      return { Exito: true, Datos: ListaPrestamos, Mensaje: "Préstamos cargados exitosamente." };
    } catch (Error) {
      return { Exito: false, Datos: [], Mensaje: "Error al cargar préstamos: " + Error.message };
    }
  }

  static async RegistrarPrestamo(IdCliente, NombreCliente, Monto, PorcentajeInteres, MontoTotal, SaldoPendiente, ModalidadCobro, Estado) {
    try {
      const ColeccionPrestamos = collection(BaseDatosFirestore, "Prestamos");
      const ConsultaMaxId = query(ColeccionPrestamos, orderBy("Id", "desc"), limit(1));
      const MaxIdSnap = await getDocs(ConsultaMaxId);

      let NuevoId = 1;
      if (!MaxIdSnap.empty) {
        NuevoId = (MaxIdSnap.docs[0].data().Id || 0) + 1;
      }

      const NuevoIdTexto = NuevoId.toString();
      const ReferenciaDoc = doc(BaseDatosFirestore, "Prestamos", NuevoIdTexto);

      await setDoc(ReferenciaDoc, {
        Id: NuevoId,
        IdCliente: Number(IdCliente),
        NombreCliente: NombreCliente,
        Monto: Number(Monto),
        PorcentajeInteres: Number(PorcentajeInteres),
        MontoTotal: Number(MontoTotal),
        SaldoPendiente: Number(SaldoPendiente),
        ModalidadCobro: ModalidadCobro,
        Estado: Estado || "Activo",
        FechaRegistro: new Date().toISOString()
      });

      return { Exito: true, Uid: NuevoIdTexto, Mensaje: "Préstamo registrado exitosamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al registrar préstamo: " + Error.message };
    }
  }

  static async ActualizarPrestamo(IdDocumento, IdCliente, NombreCliente, Monto, PorcentajeInteres, MontoTotal, SaldoPendiente, ModalidadCobro, Estado) {
    try {
      const ReferenciaDoc = doc(BaseDatosFirestore, "Prestamos", IdDocumento);
      await setDoc(ReferenciaDoc, {
        Id: parseInt(IdDocumento) || 0,
        IdCliente: Number(IdCliente),
        NombreCliente: NombreCliente,
        Monto: Number(Monto),
        PorcentajeInteres: Number(PorcentajeInteres),
        MontoTotal: Number(MontoTotal),
        SaldoPendiente: Number(SaldoPendiente),
        ModalidadCobro: ModalidadCobro,
        Estado: Estado
      }, { merge: true });

      return { Exito: true, Mensaje: "Préstamo actualizado correctamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al actualizar préstamo: " + Error.message };
    }
  }

  // =========================================================
  // GESTIÓN DE PAGOS
  // =========================================================

  static async RegistrarPago(IdPrestamo, MontoAbonado) {
    try {
      const ReferenciaPrestamo = doc(BaseDatosFirestore, "Prestamos", IdPrestamo);
      const PrestamoSnap = await getDoc(ReferenciaPrestamo);

      if (!PrestamoSnap.exists()) {
        return { Exito: false, Mensaje: "El préstamo no existe." };
      }

      const DatosPrestamo = PrestamoSnap.data();
      const MontoNum = Number(MontoAbonado);
      let NuevoSaldo = Number(DatosPrestamo.SaldoPendiente) - MontoNum;
      if (NuevoSaldo < 0) NuevoSaldo = 0;

      let NuevoEstado = DatosPrestamo.Estado;
      if (NuevoSaldo === 0) {
        NuevoEstado = "Pagado";
      }

      // Actualizar Préstamo
      await setDoc(ReferenciaPrestamo, {
        SaldoPendiente: NuevoSaldo,
        Estado: NuevoEstado
      }, { merge: true });

      // Registrar Documento de Pago
      const ColeccionPagos = collection(BaseDatosFirestore, "Pagos");
      const ConsultaMaxId = query(ColeccionPagos, orderBy("Id", "desc"), limit(1));
      const MaxIdSnap = await getDocs(ConsultaMaxId);

      let NuevoId = 1;
      if (!MaxIdSnap.empty) {
        NuevoId = (MaxIdSnap.docs[0].data().Id || 0) + 1;
      }

      const NuevoIdTexto = NuevoId.toString();
      const ReferenciaPagoDoc = doc(BaseDatosFirestore, "Pagos", NuevoIdTexto);

      await setDoc(ReferenciaPagoDoc, {
        Id: NuevoId,
        IdPrestamo: IdPrestamo,
        MontoAbonado: MontoNum,
        FechaPago: new Date().toISOString()
      });

      return { Exito: true, Mensaje: "Pago registrado exitosamente." };
    } catch (Error) {
      return { Exito: false, Mensaje: "Error al registrar el pago: " + Error.message };
    }
  }

  static async ObtenerPagosPorPrestamo(IdPrestamo) {
    try {
      const ColeccionPagos = collection(BaseDatosFirestore, "Pagos");
      const Consulta = query(ColeccionPagos, where("IdPrestamo", "==", IdPrestamo));
      const DocumentosSnap = await getDocs(Consulta);

      let ListaPagos = [];
      DocumentosSnap.forEach((Doc) => {
        ListaPagos.push({ IdDocumento: Doc.id, ...Doc.data() });
      });

      ListaPagos.sort((A, B) => new Date(B.FechaPago) - new Date(A.FechaPago));
      return { Exito: true, Datos: ListaPagos, Mensaje: "Pagos cargados exitosamente." };
    } catch (Error) {
      return { Exito: false, Datos: [], Mensaje: "Error al cargar pagos: " + Error.message };
    }
  }

}
