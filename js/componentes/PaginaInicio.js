import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";

export class PaginaInicio {
  static async Renderizar() {
    const HtmlCuerpo = `
      <!-- BANNER DE BIENVENIDA -->
      <div class="BannerBienvenida">
        <div class="BannerIcono">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">Bienvenido al Sistema YAC-Préstamos</h2>
          <p style="opacity: 0.95; font-size: 0.95rem;">Panel de control financiero y monitoreo en tiempo real.</p>
        </div>
      </div>

      <!-- GRID DE MÉTRICAS -->
      <div class="GridMetricas">
        <div class="TarjetaMetrica">
          <div class="IconoMetrica Verde">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <div class="ValorMetrica" id="MetricaClientesActivos">0</div>
            <div class="TituloMetrica">Clientes Activos</div>
          </div>
        </div>

        <div class="TarjetaMetrica">
          <div class="IconoMetrica Azul">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <div class="ValorMetrica" id="MetricaPrestamosActivos">0</div>
            <div class="TituloMetrica">Préstamos Activos</div>
          </div>
        </div>

        <div class="TarjetaMetrica">
          <div class="IconoMetrica Amarillo">
            <i class="fa-solid fa-sack-dollar"></i>
          </div>
          <div>
            <div class="ValorMetrica" id="MetricaMontoPrestado">Bs. 0.00</div>
            <div class="TituloMetrica">Total Prestado</div>
          </div>
        </div>

        <div class="TarjetaMetrica">
          <div class="IconoMetrica Rojo">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <div>
            <div class="ValorMetrica" id="MetricaSaldoPendiente">Bs. 0.00</div>
            <div class="TituloMetrica">Saldo Pendiente</div>
          </div>
        </div>
      </div>

      <!-- TARJETA DE ACCESO RÁPIDO -->
      <div class="Tarjeta">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--color-texto-primario);">
          <i class="fa-solid fa-bolt" style="color: var(--color-advertencia); margin-right: 0.5rem;"></i> Accesos Rápidos
        </h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="#prestamos" class="Boton Boton-Primario">
            <i class="fa-solid fa-plus"></i> Gestionar Préstamos
          </a>
          <a href="#clientes" class="Boton Boton-Secundario">
            <i class="fa-solid fa-user-plus"></i> Registrar Cliente
          </a>
          <a href="#usuarios" class="Boton Boton-Secundario">
            <i class="fa-solid fa-users-gear"></i> Administrar Usuarios
          </a>
        </div>
      </div>
    `;

    await LayoutPrincipal.Renderizar(HtmlCuerpo, "inicio");
    this.CargarMetricas();
  }

  static async CargarMetricas() {
    try {
      const [RespuestaClientes, RespuestaPrestamos] = await Promise.all([
        ServicioFirebase.ObtenerClientes(),
        ServicioFirebase.ObtenerPrestamos()
      ]);

      const ListaClientes = RespuestaClientes.Datos || [];
      const ListaPrestamos = RespuestaPrestamos.Datos || [];

      const ClientesActivos = ListaClientes.filter(c => c.EstaHabilitado).length;
      const PrestamosActivos = ListaPrestamos.filter(p => p.Estado === "Activo" || p.Estado === "Atrasado").length;
      
      const MontoTotalPrestado = ListaPrestamos.reduce((Acum, p) => Acum + (Number(p.MontoTotal) || 0), 0);
      const SaldoPendienteTotal = ListaPrestamos.reduce((Acum, p) => Acum + (Number(p.SaldoPendiente) || 0), 0);

      const ElClientes = document.getElementById("MetricaClientesActivos");
      const ElPrestamos = document.getElementById("MetricaPrestamosActivos");
      const ElMonto = document.getElementById("MetricaMontoPrestado");
      const ElSaldo = document.getElementById("MetricaSaldoPendiente");

      if (ElClientes) ElClientes.textContent = ClientesActivos;
      if (ElPrestamos) ElPrestamos.textContent = PrestamosActivos;
      if (ElMonto) ElMonto.textContent = `Bs. ${MontoTotalPrestado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (ElSaldo) ElSaldo.textContent = `Bs. ${SaldoPendienteTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (Error) {
      console.error("Error al cargar métricas del panel:", Error);
    }
  }
}
