import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";
import { ComponentePaginacion } from "./ComponentePaginacion.js";
import { ModalUsuario } from "./ModalUsuario.js";

export class PaginaUsuarios {
  static ListaUsuarios = [];
  static ListaRoles = [];
  static PaginaActual = 1;
  static ElementosPorPagina = 10;
  static TextoBusqueda = "";

  static async Renderizar() {
    const HtmlCuerpo = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-primario);">Gestión de Usuarios</h2>
          <p style="color: var(--color-texto-secundario); font-size: 0.85rem;">Control de accesos, roles y operadores del sistema.</p>
        </div>
        <button class="Boton Boton-Primario" id="BotonNuevoUsuario">
          <i class="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <div class="ContenedorTabla">
        <div class="ToolbarTabla">
          <div class="TituloTabla">Lista de Usuarios</div>
          <div class="EnvoltorioInput" style="max-width: 320px; width: 100%;">
            <i class="fa-solid fa-magnifying-glass IconoInput"></i>
            <input type="text" id="InputBuscarUsuario" class="ControlInput" placeholder="Buscar por nombre o correo..." />
          </div>
        </div>

        <!-- VISTA TABLA PARA ESCRITORIO -->
        <div class="VistaTablaEscritorio TablaResponsiva">
          <table class="Tabla">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style="text-align: center; width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody id="CuerpoTablaUsuarios">
              <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                  <div class="Spinner SpinnerOscuro"></div>
                  <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando usuarios...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA TARJETAS (CARDS) PARA MÓVIL -->
        <div class="VistaTarjetasMovil" id="ContenedorTarjetasUsuariosMovil">
          <div style="text-align: center; padding: 2rem;">
            <div class="Spinner SpinnerOscuro"></div>
            <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando usuarios...</div>
          </div>
        </div>
      </div>

      <div id="ContenedorPaginacionUsuarios"></div>
    `;

    await LayoutPrincipal.Renderizar(HtmlCuerpo, "usuarios");
    this.AdjuntarEventos();
    await this.CargarDatos();
  }

  static AdjuntarEventos() {
    const BotonNuevo = document.getElementById("BotonNuevoUsuario");
    const InputBuscar = document.getElementById("InputBuscarUsuario");

    if (BotonNuevo) {
      BotonNuevo.addEventListener("click", () => {
        ModalUsuario.Abrir({
          Usuario: null,
          Roles: this.ListaRoles,
          AlGuardar: () => this.CargarDatos()
        });
      });
    }

    if (InputBuscar) {
      InputBuscar.addEventListener("input", (e) => {
        this.TextoBusqueda = e.target.value.trim().toLowerCase();
        this.PaginaActual = 1;
        this.ActualizarTabla();
      });
    }
  }

  static async CargarDatos() {
    try {
      const [RespRoles, RespUsers] = await Promise.all([
        ServicioFirebase.ObtenerRoles(),
        ServicioFirebase.ObtenerUsuarios()
      ]);

      this.ListaRoles = RespRoles.Datos || [];
      this.ListaUsuarios = RespUsers.Datos || [];
      this.ActualizarTabla();
    } catch (Error) {
      ServicioNotificaciones.MostrarError("Error al cargar la lista de usuarios: " + Error.message);
    }
  }

  static ObtenerNombreRol(IdRol) {
    const RolEncontrado = this.ListaRoles.find((r) => r.Id === IdRol);
    return RolEncontrado ? RolEncontrado.Descripcion : "Usuario";
  }

  static ActualizarTabla() {
    const CuerpoTabla = document.getElementById("CuerpoTablaUsuarios");
    const ContenedorMovil = document.getElementById("ContenedorTarjetasUsuariosMovil");
    const ContenedorPaginacion = document.getElementById("ContenedorPaginacionUsuarios");
    if (!CuerpoTabla || !ContenedorMovil) return;

    const UsuariosFiltrados = this.ListaUsuarios.filter((u) => {
      if (!this.TextoBusqueda) return true;
      const Nombre = (u.NombreUsuario || "").toLowerCase();
      const Correo = (u.CorreoElectronico || "").toLowerCase();
      return Nombre.includes(this.TextoBusqueda) || Correo.includes(this.TextoBusqueda);
    });

    if (UsuariosFiltrados.length === 0) {
      const VacioHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--color-texto-atenuado);">
          <i class="fa-solid fa-user-slash" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
          No se encontraron usuarios registrados.
        </div>
      `;
      CuerpoTabla.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No se encontraron usuarios.</td></tr>`;
      ContenedorMovil.innerHTML = VacioHTML;
      if (ContenedorPaginacion) ContenedorPaginacion.innerHTML = "";
      return;
    }

    const TotalPaginas = Math.ceil(UsuariosFiltrados.length / this.ElementosPorPagina) || 1;
    if (this.PaginaActual > TotalPaginas) this.PaginaActual = TotalPaginas;

    const Inicio = (this.PaginaActual - 1) * this.ElementosPorPagina;
    const PaginaElementos = UsuariosFiltrados.slice(Inicio, Inicio + this.ElementosPorPagina);

    let FilasTablaHTML = "";
    let TarjetasMovilHTML = "";

    PaginaElementos.forEach((User) => {
      const EstadoBadge = User.EstaHabilitado
        ? '<span class="Badge Badge-Habilitado"><i class="fa-solid fa-circle-check"></i> Habilitado</span>'
        : '<span class="Badge Badge-Deshabilitado"><i class="fa-solid fa-ban"></i> Deshabilitado</span>';

      // 1. Fila de Tabla para Escritorio
      FilasTablaHTML += `
        <tr>
          <td><strong>#${User.Id || "-"}</strong></td>
          <td style="font-weight: 600;">${User.NombreUsuario || "Sin Nombre"}</td>
          <td>${User.CorreoElectronico || "-"}</td>
          <td><span class="Badge Badge-Info">${this.ObtenerNombreRol(User.IdRol)}</span></td>
          <td>${EstadoBadge}</td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button class="Boton-Icono Editar" data-id="${User.IdDocumento}" title="Editar Usuario">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="Boton-Icono ${User.EstaHabilitado ? "Eliminar" : "Exito"}" data-toggle-id="${User.IdDocumento}" title="${User.EstaHabilitado ? "Deshabilitar" : "Habilitar"}">
                <i class="fa-solid ${User.EstaHabilitado ? "fa-ban" : "fa-circle-check"}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;

      // 2. Tarjeta (Card) para Móvil con Botón Secundario adaptable a Modo Claro/Oscuro
      TarjetasMovilHTML += `
        <div class="TarjetaRegistroMovil">
          <div class="CabeceraRegistroMovil">
            <div>
              <span class="IdRegistroMovil">#${User.Id || "-"}</span>
              <span class="NombreRegistroMovil">${User.NombreUsuario || "Sin Nombre"}</span>
            </div>
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <span class="Badge Badge-Info">${this.ObtenerNombreRol(User.IdRol)}</span>
              ${EstadoBadge}
            </div>
          </div>

          <div class="CuerpoRegistroMovil">
            <div class="ItemDatoMovil">
              <i class="fa-solid fa-envelope"></i>
              <span>${User.CorreoElectronico || "-"}</span>
            </div>
          </div>

          <div class="AccionesRegistroMovil">
            <button class="Boton Boton-Secundario Boton-Sm" data-id="${User.IdDocumento}">
              <i class="fa-solid fa-pen-to-square" style="color: var(--color-info);"></i> Editar
            </button>
            <button class="Boton Boton-Secundario Boton-Sm" data-toggle-id="${User.IdDocumento}">
              <i class="fa-solid ${User.EstaHabilitado ? "fa-ban" : "fa-circle-check"}" style="color: ${User.EstaHabilitado ? "var(--color-peligro)" : "var(--color-exito)"};"></i>
              ${User.EstaHabilitado ? "Deshabilitar" : "Habilitar"}
            </button>
          </div>
        </div>
      `;
    });

    CuerpoTabla.innerHTML = FilasTablaHTML;
    ContenedorMovil.innerHTML = TarjetasMovilHTML;

    // Paginación
    if (ContenedorPaginacion) {
      ContenedorPaginacion.innerHTML = ComponentePaginacion.Renderizar({
        PaginaActual: this.PaginaActual,
        TotalPaginas: TotalPaginas
      });
      ComponentePaginacion.AdjuntarEventos(ContenedorPaginacion, (NuevaPagina) => {
        this.PaginaActual = NuevaPagina;
        this.ActualizarTabla();
      });
    }

    // Eventos
    const AsignarEventosBotones = (Contenedor) => {
      Contenedor.querySelectorAll("[data-id]").forEach((Boton) => {
        Boton.addEventListener("click", () => {
          const DocId = Boton.dataset.id;
          const User = this.ListaUsuarios.find((u) => u.IdDocumento === DocId);
          if (User) {
            ModalUsuario.Abrir({
              Usuario: User,
              Roles: this.ListaRoles,
              AlGuardar: () => this.CargarDatos()
            });
          }
        });
      });

      Contenedor.querySelectorAll("[data-toggle-id]").forEach((Boton) => {
        Boton.addEventListener("click", async () => {
          const DocId = Boton.dataset.toggleId;
          const User = this.ListaUsuarios.find((u) => u.IdDocumento === DocId);
          if (User) {
            const NuevoEstado = !User.EstaHabilitado;
            try {
              const Resp = await ServicioFirebase.ActualizarUsuario(
                User.IdDocumento,
                User.NombreUsuario,
                User.CorreoElectronico,
                User.Contrasena,
                NuevoEstado,
                User.IdRol
              );
              if (Resp.Exito) {
                User.EstaHabilitado = NuevoEstado;
                ServicioNotificaciones.MostrarExito(NuevoEstado ? "Usuario habilitado." : "Usuario deshabilitado.");
                this.ActualizarTabla();
              } else {
                ServicioNotificaciones.MostrarError(Resp.Mensaje || "No se pudo cambiar el estado.");
              }
            } catch (Err) {
              ServicioNotificaciones.MostrarError("Error: " + Err.message);
            }
          }
        });
      });
    };

    AsignarEventosBotones(CuerpoTabla);
    AsignarEventosBotones(ContenedorMovil);
  }
}