import { ServicioFirebase } from "./ServicioFirebase.js";

export class ServicioSesion {
  static ClaveStorage = "usuario_yac";

  static GuardarSesion(Uid) {
    localStorage.setItem(this.ClaveStorage, Uid);
  }

  static ObtenerUidSesion() {
    return localStorage.getItem(this.ClaveStorage);
  }

  static EstaAutenticado() {
    const Uid = this.ObtenerUidSesion();
    return Boolean(Uid && Uid.trim().length > 0);
  }

  static CerrarSesion() {
    localStorage.removeItem(this.ClaveStorage);
  }

  static async ObtenerUsuarioActual() {
    const Uid = this.ObtenerUidSesion();
    if (!Uid) return null;

    const Respuesta = await ServicioFirebase.ObtenerUsuarioPorId(Uid);
    if (Respuesta.Exito && Respuesta.Datos) {
      return Respuesta.Datos;
    }
    return null;
  }
}
