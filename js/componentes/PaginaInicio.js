import { LayoutPrincipal } from "./LayoutPrincipal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";

export class PaginaInicio {
  static async Renderizar() {
    const FechaHoy = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const FechaCapitalizada = FechaHoy.charAt(0).toUpperCase() + FechaHoy.slice(1);

    const HtmlCuerpo = `
      <div class="ContenedorInicioCompacto">
        
        <!-- BANNER ELEGANTE Y COMPACTO -->
        <div class="BannerInicioCompacto">
          <div class="BannerInfoIzquierda">
            <div class="BannerBadgeFecha">
              <i class="fa-regular fa-calendar-check"></i> ${FechaCapitalizada}
            </div>
            <h2 class="BannerTituloCompacto">YAC-Préstamos</h2>
            <p class="BannerSubtituloCompacto">Resumen financiero y estado de cartera en tiempo real</p>
          </div>
          <div class="BannerIconoCompacto">
            <i class="fa-solid fa-vault"></i>
          </div>
        </div>

        <!-- BARRA DE ACCESOS RÁPIDOS COMPACTA -->
        <div class="ContenedorAccesosRapidosSleek">
          <div class="EtiquetaSeccionAccesos">
            <i class="fa-solid fa-bolt" style="color: var(--color-advertencia);"></i>
            <span>Accesos Rápidos:</span>
          </div>
          <div class="ListaPillsAccesos">
            <a href="#prestamos" class="PillAcceso Verde">
              <i class="fa-solid fa-plus"></i>
              <span class="TextoLargo">Nuevo Préstamo</span>
              <span class="TextoCorto">Préstamo</span>
            </a>
            <a href="#clientes" class="PillAcceso Azul">
              <i class="fa-solid fa-user-plus"></i>
              <span class="TextoLargo">Registrar Cliente</span>
              <span class="TextoCorto">Cliente</span>
            </a>
            <a href="#usuarios" class="PillAcceso Morado">
              <i class="fa-solid fa-users-gear"></i>
              <span class="TextoLargo">Usuarios</span>
              <span class="TextoCorto">Usuarios</span>
            </a>
          </div>
        </div>

        <!-- GRID DE KPIS / MÉTRICAS COMPACTAS -->
        <div class="GridKpisCompacto">
          
          <div class="TarjetaKpiCompacta Verde">
            <div class="KpiEncabezado">
              <span class="KpiEtiqueta">Clientes Activos</span>
              <div class="KpiIconoContenedor Verde">
                <i class="fa-solid fa-users"></i>
              </div>
            </div>
            <div class="KpiValor" id="MetricaClientesActivos">0</div>
            <div class="KpiPie">
              <i class="fa-solid fa-circle-check"></i> Clientes activos
            </div>
          </div>

          <div class="TarjetaKpiCompacta Azul">
            <div class="KpiEncabezado">
              <span class="KpiEtiqueta">Préstamos Activos</span>
              <div class="KpiIconoContenedor Azul">
                <i class="fa-solid fa-file-contract"></i>
              </div>
            </div>
            <div class="KpiValor" id="MetricaPrestamosActivos">0</div>
            <div class="KpiPie">
              <i class="fa-solid fa-arrows-rotate"></i> En amortización
            </div>
          </div>

          <div class="TarjetaKpiCompacta Amarillo">
            <div class="KpiEncabezado">
              <span class="KpiEtiqueta">Total Prestado (Capital)</span>
              <div class="KpiIconoContenedor Amarillo">
                <i class="fa-solid fa-sack-dollar"></i>
              </div>
            </div>
            <div class="KpiValor" id="MetricaMontoPrestado">Bs. 0.00</div>
            <div class="KpiPie">
              <i class="fa-solid fa-coins"></i> Capital colocado
            </div>
          </div>

          <div class="TarjetaKpiCompacta Rojo">
            <div class="KpiEncabezado">
              <span class="KpiEtiqueta">Saldo Pendiente</span>
              <div class="KpiIconoContenedor Rojo">
                <i class="fa-solid fa-hand-holding-dollar"></i>
              </div>
            </div>
            <div class="KpiValor" id="MetricaSaldoPendiente">Bs. 0.00</div>
            <div class="KpiPie">
              <i class="fa-solid fa-clock"></i> Por recuperar
            </div>
          </div>

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
      
      const MontoCapitalPrestado = ListaPrestamos.reduce((Acum, p) => Acum + (Number(p.Monto) || 0), 0);
      const SaldoPendienteTotal = ListaPrestamos.reduce((Acum, p) => Acum + (Number(p.SaldoPendiente) || 0), 0);

      const ElClientes = document.getElementById("MetricaClientesActivos");
      const ElPrestamos = document.getElementById("MetricaPrestamosActivos");
      const ElMonto = document.getElementById("MetricaMontoPrestado");
      const ElSaldo = document.getElementById("MetricaSaldoPendiente");

      if (ElClientes) ElClientes.textContent = ClientesActivos;
      if (ElPrestamos) ElPrestamos.textContent = PrestamosActivos;
      if (ElMonto) ElMonto.textContent = `Bs. ${MontoCapitalPrestado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (ElSaldo) ElSaldo.textContent = `Bs. ${SaldoPendienteTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (Error) {
      console.error("Error al cargar métricas del panel:", Error);
    }
  }
}
