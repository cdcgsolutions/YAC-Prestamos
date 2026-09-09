import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";
import { ComponentePaginacion } from "./ComponentePaginacion.js";
import { ModalPrestamo } from "./ModalPrestamo.js";
import { ModalPago } from "./ModalPago.js";
import { ModalHistorialPagos } from "./ModalHistorialPagos.js";

export class PaginaPrestamos {
  static ListaPrestamos = [];
  static ListaClientes = [];
  static PaginaActual = 1;
  static ElementosPorPagina = 9;
  static TextoBusqueda = "";
  static FiltroEstado = "Todos";
  static FiltroModalidad = "Todas";

  static async Renderizar() {
    const HtmlCuerpo = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--color-primario);">Gestión de Préstamos</h2>
          <p style="color: var(--color-texto-secundario); font-size: 0.9rem;">Emisión, cálculo de intereses y seguimiento de amortizaciones.</p>
        </div>
        <button class="Boton Boton-Primario" id="BotonNuevoPrestamo">
          <i class="fa-solid fa-plus"></i> Nuevo Préstamo
        </button>
      </div>

      <!-- FILTROS Y BÚSQUEDA -->
      <div class="Tarjeta" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: center;">
          <div class="EnvoltorioInput">
            <i class="fa-solid fa-magnifying-glass IconoInput"></i>
            <input type="text" id="InputBuscarPrestamo" class="ControlInput" placeholder="Buscar por cliente o # ID..." />
          </div>

          <div class="EnvoltorioInput">
            <i class="fa-solid fa-filter IconoInput"></i>
            <select id="SelectFiltroEstado" class="ControlInput">
              <option value="Todos">Filtrar por Estado (Todos)</option>
              <option value="Activo">Activo</option>
              <option value="Pagado">Pagado</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>

          <div class="EnvoltorioInput">
            <i class="fa-solid fa-calendar-days IconoInput"></i>
            <select id="SelectFiltroModalidad" class="ControlInput">
              <option value="Todas">Modalidad de Cobro (Todas)</option>
              <option value="Diario">Diario</option>
              <option value="Semanal">Semanal</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Mensual">Mensual</option>
            </select>
          </div>
        </div>
      </div>

      <!-- GRID DE TARJETAS DE PRÉSTAMOS -->
      <div id="ContenedorGridPrestamos" class="GridPrestamos">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <div class="Spinner SpinnerOscuro"></div>
          <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando préstamos...</div>
        </div>
      </div>

      <div id="ContenedorPaginacionPrestamos"></div>
    `;

    await LayoutPrincipal.Renderizar(HtmlCuerpo, "prestamos");
    this.AdjuntarEventos();
    await this.CargarDatos();
  }

  static AdjuntarEventos() {
    const BotonNuevo = document.getElementById("BotonNuevoPrestamo");
    const InputBuscar = document.getElementById("InputBuscarPrestamo");
    const SelectEstado = document.getElementById("SelectFiltroEstado");
    const SelectModalidad = document.getElementById("SelectFiltroModalidad");

    if (BotonNuevo) {
      BotonNuevo.addEventListener("click", () => {
        ModalPrestamo.Abrir({
          Prestamo: null,
          Clientes: this.ListaClientes,
          AlGuardar: () => this.CargarDatos()
        });
      });
    }

    if (InputBuscar) {
      InputBuscar.addEventListener("input", (e) => {
        this.TextoBusqueda = e.target.value.trim().toLowerCase();
        this.PaginaActual = 1;
        this.ActualizarGrid();
      });
    }

    if (SelectEstado) {
      SelectEstado.addEventListener("change", (e) => {
        this.FiltroEstado = e.target.value;
        this.PaginaActual = 1;
        this.ActualizarGrid();
      });
    }

    if (SelectModalidad) {
      SelectModalidad.addEventListener("change", (e) => {
        this.FiltroModalidad = e.target.value;
        this.PaginaActual = 1;
        this.ActualizarGrid();
      });
    }
  }

  static async CargarDatos() {
    try {
      const [RespClientes, RespPrestamos] = await Promise.all([
        ServicioFirebase.ObtenerClientes(),
        ServicioFirebase.ObtenerPrestamos()
      ]);

      this.ListaClientes = RespClientes.Datos || [];
      this.ListaPrestamos = RespPrestamos.Datos || [];
      this.ActualizarGrid();
    } catch (Error) {
      ServicioNotificaciones.MostrarError("Error al cargar los préstamos: " + Error.message);
    }
  }

  static ObtenerColorEstado(Estado) {
    switch (Estado) {
      case "Activo": return "Badge-Activo";
      case "Pagado": return "Badge-Pagado";
      case "Atrasado": return "Badge-Atrasado";
      case "Anulado": return "Badge-Anulado";
      default: return "Badge-Info";
    }
  }

  static ActualizarGrid() {
    const ContenedorGrid = document.getElementById("ContenedorGridPrestamos");
    const ContenedorPaginacion = document.getElementById("ContenedorPaginacionPrestamos");
    if (!ContenedorGrid) return;

    const PrestamosFiltrados = this.ListaPrestamos.filter((p) => {
      // Filtro Estado
      if (this.FiltroEstado !== "Todos" && p.Estado !== this.FiltroEstado) {
        return false;
      }
      // Filtro Modalidad
      if (this.FiltroModalidad !== "Todas" && p.ModalidadCobro !== this.FiltroModalidad) {
        return false;
      }
      // Búsqueda de texto
      if (this.TextoBusqueda) {
        const NombreCli = (p.NombreCliente || "").toLowerCase();
        const IdStr = (p.Id || p.IdDocumento || "").toString();
        if (!NombreCli.includes(this.TextoBusqueda) && !IdStr.includes(this.TextoBusqueda)) {
          return false;
        }
      }
      return true;
    });

    if (PrestamosFiltrados.length === 0) {
      ContenedorGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--color-superficie); border-radius: var(--radio-lg); border: 1px solid var(--color-borde); color: var(--color-texto-atenuado);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
          No se encontraron préstamos con los filtros aplicados.
        </div>
      `;
      if (ContenedorPaginacion) ContenedorPaginacion.innerHTML = "";
      return;
    }

    const TotalPaginas = Math.ceil(PrestamosFiltrados.length / this.ElementosPorPagina) || 1;
    if (this.PaginaActual > TotalPaginas) this.PaginaActual = TotalPaginas;

    const Inicio = (this.PaginaActual - 1) * this.ElementosPorPagina;
    const PaginaElementos = PrestamosFiltrados.slice(Inicio, Inicio + this.ElementosPorPagina);

    let TarjetasHTML = "";
    PaginaElementos.forEach((Prestamo) => {
      const MontoTotal = Number(Prestamo.MontoTotal) || 0;
      const SaldoPendiente = Number(Prestamo.SaldoPendiente) || 0;
      const MontoPagado = Math.max(0, MontoTotal - SaldoPendiente);
      
      let PorcentajeProgreso = 0;
      if (MontoTotal > 0) {
        PorcentajeProgreso = Math.min(100, (MontoPagado / MontoTotal) * 100);
      }

      TarjetasHTML += `
        <div class="TarjetaPrestamo">
          <div>
            <div class="CabeceraPrestamo">
              <div>
                <div class="NombreClientePrestamo">${Prestamo.NombreCliente || "Cliente"}</div>
                <div class="DetalleModalidad">
                  <i class="fa-solid fa-hashtag"></i> ID: #${Prestamo.Id || Prestamo.IdDocumento || "-"} | 
                  <i class="fa-regular fa-calendar"></i> ${Prestamo.ModalidadCobro || "Mensual"}
                </div>
              </div>
              <span class="Badge ${this.ObtenerColorEstado(Prestamo.Estado)}">${Prestamo.Estado || "Activo"}</span>
            </div>

            <div class="SeparadorPrestamo"></div>

            <div class="FilaDetallePrestamo">
              <span class="EtiquetaDetalle">Monto Prestado:</span>
              <span class="ValorDetalle">Bs. ${Number(Prestamo.Monto || 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })} (${Prestamo.PorcentajeInteres || 0}%)</span>
            </div>

            <div class="FilaDetallePrestamo">
              <span class="EtiquetaDetalle">Total a Pagar:</span>
              <span class="ValorDetalle" style="color: var(--color-primario);">Bs. ${MontoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
            </div>

            <div class="BarraProgresoEnvoltorio">
              <div class="CabeceraProgreso">
                <span style="color: var(--color-texto-secundario);">Progreso: ${PorcentajeProgreso.toFixed(0)}%</span>
                <span style="font-weight: 700; color: ${SaldoPendiente > 0 ? "var(--color-peligro)" : "var(--color-exito)"};">
                  Saldo: Bs. ${SaldoPendiente.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div class="BarraProgresoFondo">
                <div class="BarraProgresoRelleno" style="width: ${PorcentajeProgreso}%;"></div>
              </div>
            </div>
          </div>

          <div class="AccionesPrestamo">
            <button class="Boton-Icono Editar" data-editar-id="${Prestamo.IdDocumento}" title="Editar Préstamo">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="Boton-Icono Exito" data-pagar-id="${Prestamo.IdDocumento}" title="Registrar Pago" ${Prestamo.Estado === "Pagado" ? "disabled" : ""}>
              <i class="fa-solid fa-money-bill-wave"></i>
            </button>
            <button class="Boton-Icono" data-historial-id="${Prestamo.IdDocumento}" title="Historial de Pagos" style="color: var(--color-secundario);">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
          </div>
        </div>
      `;
    });

    ContenedorGrid.innerHTML = TarjetasHTML;

    // Paginación
    if (ContenedorPaginacion) {
      ContenedorPaginacion.innerHTML = ComponentePaginacion.Renderizar({
        PaginaActual: this.PaginaActual,
        TotalPaginas: TotalPaginas
      });
      ComponentePaginacion.AdjuntarEventos(ContenedorPaginacion, (NuevaPagina) => {
        this.PaginaActual = NuevaPagina;
        this.ActualizarGrid();
      });
    }

    // Eventos de botones
    ContenedorGrid.querySelectorAll("[data-editar-id]").forEach((Boton) => {
      Boton.addEventListener("click", () => {
        const DocId = Boton.dataset.editarId;
        const P = this.ListaPrestamos.find((item) => item.IdDocumento === DocId);
        if (P) {
          ModalPrestamo.Abrir({
            Prestamo: P,
            Clientes: this.ListaClientes,
            AlGuardar: () => this.CargarDatos()
          });
        }
      });
    });

    ContenedorGrid.querySelectorAll("[data-pagar-id]").forEach((Boton) => {
      Boton.addEventListener("click", () => {
        const DocId = Boton.dataset.pagarId;
        const P = this.ListaPrestamos.find((item) => item.IdDocumento === DocId);
        if (P) {
          ModalPago.Abrir({
            Prestamo: P,
            AlGuardar: () => this.CargarDatos()
          });
        }
      });
    });

    ContenedorGrid.querySelectorAll("[data-historial-id]").forEach((Boton) => {
      Boton.addEventListener("click", () => {
        const DocId = Boton.dataset.historialId;
        const P = this.ListaPrestamos.find((item) => item.IdDocumento === DocId);
        if (P) {
          ModalHistorialPagos.Abrir({
            Prestamo: P
          });
        }
      });
    });
  }
}
