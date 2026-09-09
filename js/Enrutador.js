import { ServicioSesion } from "./servicios/ServicioSesion.js";
import { PaginaLogin } from "./componentes/PaginaLogin.js?v=3";
import { PaginaInicio } from "./componentes/PaginaInicio.js?v=3";
import { PaginaUsuarios } from "./componentes/PaginaUsuarios.js?v=3";
import { PaginaClientes } from "./componentes/PaginaClientes.js?v=3";
import { PaginaPrestamos } from "./componentes/PaginaPrestamos.js?v=3";

export class Enrutador {
  static Rutas = {
    login: PaginaLogin,
    inicio: PaginaInicio,
    usuarios: PaginaUsuarios,
    clientes: PaginaClientes,
    prestamos: PaginaPrestamos
  };

  static Inicializar() {
    window.addEventListener("hashchange", () => this.ManejarCambioRuta());
    this.ManejarCambioRuta();
  }

  static ObtenerRutaActual() {
    const Hash = window.location.hash.replace("#", "").trim().toLowerCase();
    return Hash || "inicio";
  }

  static NavegarA(NombreRuta) {
    window.location.hash = `#${NombreRuta}`;
  }

  static async ManejarCambioRuta() {
    let Ruta = this.ObtenerRutaActual();
    const Autenticado = ServicioSesion.EstaAutenticado();

    // Protección de rutas
    if (!Autenticado && Ruta !== "login") {
      this.NavegarA("login");
      return;
    }

    if (Autenticado && Ruta === "login") {
      this.NavegarA("inicio");
      return;
    }

    const ComponentePagina = this.Rutas[Ruta] || this.Rutas.inicio;
    if (ComponentePagina && typeof ComponentePagina.Renderizar === "function") {
      await ComponentePagina.Renderizar();
    }
  }
}