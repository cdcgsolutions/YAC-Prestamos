import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioSesion } from "../servicios/ServicioSesion.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";
import { ComponentePaginacion } from "./ComponentePaginacion.js";
import { ModalUsuario } from "./ModalUsuario.js";

export class PaginaUsuarios {
  static ListaUsuarios = [];
  static ListaRoles = [];
  static UsuarioLogueado = null;
  static PaginaActual = 1;
  static ElementosPorPagina = 10;
  static TextoBusqueda = "";

  static async Renderizar() {
    this.UsuarioLogueado = await ServicioSesion.ObtenerUsuarioActual();
    const IdRolLogueado = this.UsuarioLogueado ? Number(this.UsuarioLogueado.IdRol) : 3;
    const TienePermisosGestion = IdRolLogueado === 1 || IdRolLogueado === 2;

    const HtmlCuerpo = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-primario);">Gestión de Usuarios</h2>
          <p style="color: var(--color-texto-secundario); font-size: 0.85rem;">Control de accesos, roles y operadores del sistema.</p>
        </div>
        ${
          TienePermisosGestion
            ? `<button class="Boton Boton-Primario" id="BotonNuevoUsuario">
          <i class="fa-solid fa-user-plus"></i> <span class="TextoLargo">Nuevo Usuario</span><span class="TextoCorto">Usuario</span>
        </button>`
            : ""
        }
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
                ${TienePermisosGestion ? '<th style="text-align: center; width: 140px;">Acciones</th>' : ""}
              </tr>
            </thead>
            <tbody id="CuerpoTablaUsuarios">
              <tr>
                <td colspan="${TienePermisosGestion ? "6" : "5"}" style="text-align: center; padding: 2rem;">
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
      const [RespRoles, RespUsers, UsuarioActual] = await Promise.all([
        ServicioFirebase.ObtenerRoles(),
        ServicioFirebase.ObtenerUsuarios(),
        ServicioSesion.ObtenerUsuarioActual()
      ]);

      this.ListaRoles = RespRoles.Datos || [];
      this.ListaUsuarios = RespUsers.Datos || [];
      this.UsuarioLogueado = UsuarioActual;
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

    // Jerarquía de roles del usuario actualmente autenticado:
    const IdRolLogueado = this.UsuarioLogueado ? Number(this.UsuarioLogueado.IdRol) : 3;
    const EsSuperAdminLogueado = IdRolLogueado === 1;
    const TienePermisosGestion = IdRolLogueado === 1 || IdRolLogueado === 2;

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
      CuerpoTabla.innerHTML = `<tr><td colspan="${TienePermisosGestion ? "6" : "5"}" style="text-align: center; padding: 2rem;">No se encontraron usuarios.</td></tr>`;
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
        ? '<span class="Badge Badge-Activo"><i class="fa-solid fa-circle-check"></i> Activo</span>'
        : '<span class="Badge Badge-Inactivo"><i class="fa-solid fa-ban"></i> Inactivo</span>';

      const EsSuperAdminDestino = Number(User.IdRol) === 1;

      // Reglas de permisos:
      // - Rol 1 (SuperAdmin): puede editar y dar de baja a todos menos a sí mismo.
      // - Rol 2 (Administrador): puede editar y dar de baja a roles 2 y 3 (NO a SuperAdmin).
      // - Rol 3 (Usuario): no tiene permisos de gestión (columna de acciones oculta).
      const PuedeEditar = TienePermisosGestion && (EsSuperAdminLogueado || !EsSuperAdminDestino);
      const PuedeDesactivar = TienePermisosGestion && !EsSuperAdminDestino;

      // 1. Fila de Tabla para Escritorio
      FilasTablaHTML += `
        <tr>
          <td><strong>#${User.Id || "-"}</strong></td>
          <td style="font-weight: 600;">${User.NombreUsuario || "Sin Nombre"}</td>
          <td>${User.CorreoElectronico || "-"}</td>
          <td><span class="Badge Badge-Info">${this.ObtenerNombreRol(User.IdRol)}</span></td>
          <td>${EstadoBadge}</td>
          ${
            TienePermisosGestion
              ? `
            <td style="text-align: center;">
              <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                ${
                  PuedeEditar
                    ? `<button class="Boton-Icono Editar" data-id="${User.IdDocumento}" title="Editar Usuario">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>`
                    : `<span class="Badge Badge-Info" title="SuperAdmin protegido contra edición" style="font-size: 0.725rem; opacity: 0.85;"><i class="fa-solid fa-lock"></i> Protegido</span>`
                }
                ${
                  PuedeDesactivar
                    ? `<button class="Boton-Icono ${User.EstaHabilitado ? "Eliminar" : "Exito"}" data-toggle-id="${User.IdDocumento}" title="${User.EstaHabilitado ? "Desactivar" : "Activar"}">
                  <i class="fa-solid ${User.EstaHabilitado ? "fa-trash" : "fa-lock-open"}"></i>
                </button>`
                    : ""
                }
              </div>
            </td>
          `
              : ""
          }
        </tr>
      `;

      // 2. Tarjeta (Card) para Móvil
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

          ${
            TienePermisosGestion && (PuedeEditar || PuedeDesactivar)
              ? `
            <div class="AccionesRegistroMovil">
              ${
                PuedeEditar
                  ? `<button class="Boton Boton-Secundario Boton-Sm" data-id="${User.IdDocumento}">
                <i class="fa-solid fa-pen-to-square" style="color: var(--color-info);"></i> Editar
              </button>`
                  : `<span class="Badge Badge-Info" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;"><i class="fa-solid fa-lock"></i> SuperAdmin Protegido</span>`
              }
              ${
                PuedeDesactivar
                  ? `<button class="Boton Boton-Secundario Boton-Sm" data-toggle-id="${User.IdDocumento}">
                <i class="fa-solid ${User.EstaHabilitado ? "fa-trash" : "fa-lock-open"}" style="color: ${User.EstaHabilitado ? "var(--color-peligro)" : "var(--color-exito)"};"></i>
                ${User.EstaHabilitado ? "Desactivar" : "Activar"}
              </button>`
                  : ""
              }
            </div>
          `
              : ""
          }
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
          if (!TienePermisosGestion) {
            ServicioNotificaciones.MostrarAdvertencia("Los usuarios con rol operador no tienen permisos de edición.", "Acceso Restringido");
            return;
          }

          const DocId = Boton.dataset.id;
          const User = this.ListaUsuarios.find((u) => u.IdDocumento === DocId);
          if (User) {
            // Seguridad: Si es SuperAdmin y quien edita no es SuperAdmin, bloquear
            if (Number(User.IdRol) === 1 && !EsSuperAdminLogueado) {
              ServicioNotificaciones.MostrarAdvertencia("No tiene privilegios para modificar la cuenta de un SuperAdmin.", "Acceso Denegado");
              return;
            }

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
          if (!TienePermisosGestion) {
            ServicioNotificaciones.MostrarAdvertencia("No tiene permisos para dar de baja o activar usuarios.", "Acción no permitida");
            return;
          }

          const DocId = Boton.dataset.toggleId;
          const User = this.ListaUsuarios.find((u) => u.IdDocumento === DocId);
          if (User) {
            if (Number(User.IdRol) === 1) {
              ServicioNotificaciones.MostrarAdvertencia("El usuario SuperAdmin está protegido y no puede ser desactivado.", "Acción no permitida");
              return;
            }
            const NuevoEstado = !User.EstaHabilitado;

            const Titulo = User.EstaHabilitado ? "¿Desactivar Usuario?" : "¿Activar Usuario?";
            const Mensaje = User.EstaHabilitado
              ? `¿Está seguro de que desea desactivar a "${User.NombreUsuario}"? No podrá acceder al sistema.`
              : `¿Desea activar a "${User.NombreUsuario}" para acceder al sistema?`;
            const Icono = User.EstaHabilitado ? "warning" : "question";

            const Confirmado = await ServicioNotificaciones.Confirmar({
              Titulo,
              Mensaje,
              Icono,
              TextoConfirmar: User.EstaHabilitado ? "Sí, Desactivar" : "Sí, Activar",
              ColorBoton: User.EstaHabilitado ? "Peligro" : "Primario"
            });

            if (!Confirmado) return;

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
                ServicioNotificaciones.MostrarExito(NuevoEstado ? "Usuario activado con éxito." : "Usuario desactivado con éxito.");
                this.ActualizarTabla();
              } else {
                ServicioNotificaciones.MostrarError(Resp.Mensaje || "No se pudo cambiar el estado.");
              }
            } catch (Error) {
              ServicioNotificaciones.MostrarError("Error: " + Error.message);
            }
          }
        });
      });
    };

    AsignarEventosBotones(CuerpoTabla);
    AsignarEventosBotones(ContenedorMovil);
  }
}
