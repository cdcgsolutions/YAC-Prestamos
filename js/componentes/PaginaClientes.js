import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";
import { ComponentePaginacion } from "./ComponentePaginacion.js";
import { ModalCliente } from "./ModalCliente.js";

export class PaginaClientes {
  static ListaClientes = [];
  static PaginaActual = 1;
  static ElementosPorPagina = 10;
  static TextoBusqueda = "";

  static async Renderizar() {
    const HtmlCuerpo = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-primario);">Gestión de Clientes</h2>
          <p style="color: var(--color-texto-secundario); font-size: 0.85rem;">Registro y administración de prestatarios y cartera de clientes.</p>
        </div>
        <button class="Boton Boton-Primario" id="BotonNuevoCliente">
          <i class="fa-solid fa-user-plus"></i> Nuevo Cliente
        </button>
      </div>

      <div class="ContenedorTabla">
        <div class="ToolbarTabla">
          <div class="TituloTabla">Lista de Clientes</div>
          <div class="EnvoltorioInput" style="max-width: 320px; width: 100%;">
            <i class="fa-solid fa-magnifying-glass IconoInput"></i>
            <input type="text" id="InputBuscarCliente" class="ControlInput" placeholder="Buscar por nombre, celular..." />
          </div>
        </div>

        <!-- VISTA TABLA PARA ESCRITORIO -->
        <div class="VistaTablaEscritorio TablaResponsiva">
          <table class="Tabla">
            <thead>
              <tr>
                <th style="width: 60px;">ID</th>
                <th>Nombre Completo</th>
                <th>F. Nacimiento</th>
                <th>Estado Civil</th>
                <th>Dirección</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Estado</th>
                <th style="text-align: center; width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody id="CuerpoTablaClientes">
              <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                  <div class="Spinner SpinnerOscuro"></div>
                  <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando clientes...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA TARJETAS (CARDS) PARA MÓVIL -->
        <div class="VistaTarjetasMovil" id="ContenedorTarjetasClientesMovil">
          <div style="text-align: center; padding: 2rem;">
            <div class="Spinner SpinnerOscuro"></div>
            <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando clientes...</div>
          </div>
        </div>
      </div>

      <div id="ContenedorPaginacionClientes"></div>
    `;

    await LayoutPrincipal.Renderizar(HtmlCuerpo, "clientes");
    this.AdjuntarEventos();
    await this.CargarDatos();
  }

  static AdjuntarEventos() {
    const BotonNuevo = document.getElementById("BotonNuevoCliente");
    const InputBuscar = document.getElementById("InputBuscarCliente");

    if (BotonNuevo) {
      BotonNuevo.addEventListener("click", () => {
        ModalCliente.Abrir({
          Cliente: null,
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
      const Resp = await ServicioFirebase.ObtenerClientes();
      this.ListaClientes = Resp.Datos || [];
      this.ActualizarTabla();
    } catch (Error) {
      ServicioNotificaciones.MostrarError("Error al cargar la lista de clientes: " + Error.message);
    }
  }

  static FormatearFecha(FechaISO) {
    if (!FechaISO) return "N/A";
    try {
      const Partes = FechaISO.substring(0, 10).split("-");
      if (Partes.length === 3) {
        return `${Partes[2]}/${Partes[1]}/${Partes[0]}`;
      }
      return FechaISO;
    } catch {
      return FechaISO;
    }
  }

  static ActualizarTabla() {
    const CuerpoTabla = document.getElementById("CuerpoTablaClientes");
    const ContenedorMovil = document.getElementById("ContenedorTarjetasClientesMovil");
    const ContenedorPaginacion = document.getElementById("ContenedorPaginacionClientes");
    if (!CuerpoTabla || !ContenedorMovil) return;

    const ClientesFiltrados = this.ListaClientes.filter((c) => {
      if (!this.TextoBusqueda) return true;
      const Nombre = (c.Nombre || "").toLowerCase();
      const Celular = (c.Celular || "").toLowerCase();
      const Correo = (c.Correo || "").toLowerCase();
      const Direccion = (c.Direccion || "").toLowerCase();
      return (
        Nombre.includes(this.TextoBusqueda) ||
        Celular.includes(this.TextoBusqueda) ||
        Correo.includes(this.TextoBusqueda) ||
        Direccion.includes(this.TextoBusqueda)
      );
    });

    if (ClientesFiltrados.length === 0) {
      const VacioHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--color-texto-atenuado);">
          <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
          No se encontraron clientes registrados.
        </div>
      `;
      CuerpoTabla.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No se encontraron clientes.</td></tr>`;
      ContenedorMovil.innerHTML = VacioHTML;
      if (ContenedorPaginacion) ContenedorPaginacion.innerHTML = "";
      return;
    }

    const TotalPaginas = Math.ceil(ClientesFiltrados.length / this.ElementosPorPagina) || 1;
    if (this.PaginaActual > TotalPaginas) this.PaginaActual = TotalPaginas;

    const Inicio = (this.PaginaActual - 1) * this.ElementosPorPagina;
    const PaginaElementos = ClientesFiltrados.slice(Inicio, Inicio + this.ElementosPorPagina);

    let FilasTablaHTML = "";
    let TarjetasMovilHTML = "";

    PaginaElementos.forEach((Cli) => {
      const EstadoBadge = Cli.EstaHabilitado
        ? '<span class="Badge Badge-Habilitado"><i class="fa-solid fa-circle-check"></i> Habilitado</span>'
        : '<span class="Badge Badge-Deshabilitado"><i class="fa-solid fa-ban"></i> Deshabilitado</span>';

      // 1. Fila de tabla para escritorio
      FilasTablaHTML += `
        <tr>
          <td><strong>#${Cli.Id || "-"}</strong></td>
          <td style="font-weight: 600;">${Cli.Nombre || "Sin Nombre"}</td>
          <td>${this.FormatearFecha(Cli.FechaNacimiento)}</td>
          <td>${Cli.EstadoCivil || "-"}</td>
          <td>${Cli.Direccion || "-"}</td>
          <td><a href="tel:${Cli.Celular}" style="color: var(--color-primario); font-weight: 600;"><i class="fa-solid fa-phone" style="font-size: 0.8rem; margin-right: 0.25rem;"></i>${Cli.Celular || "-"}</a></td>
          <td>${Cli.Correo || "-"}</td>
          <td>${EstadoBadge}</td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button class="Boton-Icono Editar" data-id="${Cli.IdDocumento}" title="Editar Cliente">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="Boton-Icono ${Cli.EstaHabilitado ? "Eliminar" : "Exito"}" data-toggle-id="${Cli.IdDocumento}" title="${Cli.EstaHabilitado ? "Eliminar (Deshabilitar)" : "Restaurar (Habilitar)"}">
                <i class="fa-solid ${Cli.EstaHabilitado ? "fa-trash" : "fa-trash-can-arrow-up"}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;

      // 2. Tarjeta (Card) para móvil con botón secundario adaptable
      TarjetasMovilHTML += `
        <div class="TarjetaRegistroMovil">
          <div class="CabeceraRegistroMovil">
            <div>
              <span class="IdRegistroMovil">#${Cli.Id || "-"}</span>
              <span class="NombreRegistroMovil">${Cli.Nombre || "Sin Nombre"}</span>
            </div>
            <div>
              ${EstadoBadge}
            </div>
          </div>

          <div class="CuerpoRegistroMovil">
            <div class="ItemDatoMovil">
              <i class="fa-solid fa-phone"></i>
              <a href="tel:${Cli.Celular}" style="color: var(--color-primario); font-weight: 600;">${Cli.Celular || "Sin celular"}</a>
            </div>
            ${Cli.Direccion ? `
              <div class="ItemDatoMovil">
                <i class="fa-solid fa-location-dot"></i>
                <span>${Cli.Direccion}</span>
              </div>
            ` : ""}
            ${Cli.Correo ? `
              <div class="ItemDatoMovil">
                <i class="fa-solid fa-envelope"></i>
                <span>${Cli.Correo}</span>
              </div>
            ` : ""}
            <div class="ItemDatoMovil" style="font-size: 0.775rem; color: var(--color-texto-atenuado);">
              <i class="fa-solid fa-user"></i>
              <span>${Cli.EstadoCivil || "Estado Civil N/A"} | Nac: ${this.FormatearFecha(Cli.FechaNacimiento)}</span>
            </div>
          </div>

          <div class="AccionesRegistroMovil">
            <button class="Boton Boton-Secundario Boton-Sm" data-id="${Cli.IdDocumento}">
              <i class="fa-solid fa-pen-to-square" style="color: var(--color-info);"></i> Editar
            </button>
            <button class="Boton Boton-Secundario Boton-Sm" data-toggle-id="${Cli.IdDocumento}">
              <i class="fa-solid ${Cli.EstaHabilitado ? "fa-trash" : "fa-trash-can-arrow-up"}" style="color: ${Cli.EstaHabilitado ? "var(--color-peligro)" : "var(--color-exito)"};"></i>
              ${Cli.EstaHabilitado ? "Eliminar" : "Restaurar"}
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

    // Asignar eventos de botones
    const AsignarEventosBotones = (Contenedor) => {
      Contenedor.querySelectorAll("[data-id]").forEach((Boton) => {
        Boton.addEventListener("click", () => {
          const DocId = Boton.dataset.id;
          const Cli = this.ListaClientes.find((c) => c.IdDocumento === DocId);
          if (Cli) {
            ModalCliente.Abrir({
              Cliente: Cli,
              AlGuardar: () => this.CargarDatos()
            });
          }
        });
      });

      Contenedor.querySelectorAll("[data-toggle-id]").forEach((Boton) => {
        Boton.addEventListener("click", async () => {
          const DocId = Boton.dataset.toggleId;
          const Cli = this.ListaClientes.find((c) => c.IdDocumento === DocId);
          if (Cli) {
            const NuevoEstado = !Cli.EstaHabilitado;
            try {
              const Resp = await ServicioFirebase.ActualizarCliente(
                Cli.IdDocumento,
                Cli.Nombre,
                Cli.FechaNacimiento,
                Cli.EstadoCivil,
                Cli.Direccion,
                Cli.Celular,
                Cli.Correo,
                NuevoEstado
              );
              if (Resp.Exito) {
                Cli.EstaHabilitado = NuevoEstado;
                ServicioNotificaciones.MostrarExito(NuevoEstado ? "Cliente restaurado." : "Cliente deshabilitado.");
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