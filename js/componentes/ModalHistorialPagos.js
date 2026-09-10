import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalHistorialPagos {
  static async Abrir({ Prestamo }) {
    if (!Prestamo) return;

    const ContenidoHTML = `
      <div style="background-color: var(--color-superficie-hover); border: 1px solid var(--color-borde); border-radius: var(--radio-lg); padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <div style="font-size: 0.85rem; color: var(--color-texto-secundario);">Cliente Titular</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-texto-primario);">${Prestamo.NombreCliente || "Cliente"}</div>
        </div>
        <div class="Badge Badge-Info" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
          <i class="fa-solid fa-hashtag"></i> Préstamo #${Prestamo.Id || Prestamo.IdDocumento || "-"}
        </div>
      </div>

      <!-- VISTA TABLA PARA ESCRITORIO -->
      <div class="VistaTablaEscritorio TablaResponsiva" style="max-height: 380px; overflow-y: auto; border: 1px solid var(--color-borde); border-radius: var(--radio-md);">
        <table class="Tabla">
          <thead>
            <tr>
              <th style="width: 80px;"># Pago</th>
              <th>Fecha y Hora</th>
              <th style="text-align: right;">Monto Abonado</th>
            </tr>
          </thead>
          <tbody id="CuerpoHistorialPagos">
            <tr>
              <td colspan="3" style="text-align: center; padding: 2.5rem 1rem;">
                <div class="Spinner SpinnerOscuro"></div>
                <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando historial de pagos...</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA TARJETAS (CARDS) PARA MÓVIL -->
      <div class="VistaTarjetasMovil" id="ContenedorTarjetasHistorialMovil" style="max-height: 360px; overflow-y: auto; padding: 0.25rem 0; gap: 0.65rem;">
        <div style="text-align: center; padding: 2rem 1rem;">
          <div class="Spinner SpinnerOscuro"></div>
          <div style="margin-top: 0.5rem; color: var(--color-texto-secundario);">Cargando historial de pagos...</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-borde); flex-wrap: wrap; gap: 0.5rem;">
        <span style="font-weight: 600; color: var(--color-texto-secundario); font-size: 0.9rem;">Total Abonado a la Fecha:</span>
        <span id="TextoTotalAbonadoHistorial" style="font-size: 1.25rem; font-weight: 800; color: var(--color-primario);">Bs. 0.00</span>
      </div>
    `;

    ComponenteModal.Abrir({
      Titulo: `<i class="fa-solid fa-receipt"></i> Historial de Pagos`,
      ContenidoHTML,
      Tamano: "Mediano",
      BotonesPieHTML: `
        <button type="button" class="Boton Boton-Secundario" onclick="document.getElementById('BotonCerrarModalGlobal').click()">Cerrar</button>
      `,
      AlAbrir: async (CuerpoEl) => {
        const CuerpoTabla = CuerpoEl.querySelector("#CuerpoHistorialPagos");
        const ContenedorMovil = CuerpoEl.querySelector("#ContenedorTarjetasHistorialMovil");
        const TextoTotal = CuerpoEl.querySelector("#TextoTotalAbonadoHistorial");

        try {
          const Respuesta = await ServicioFirebase.ObtenerPagosPorPrestamo(Prestamo.IdDocumento);
          const ListaPagos = Respuesta.Datos || [];

          if (ListaPagos.length === 0) {
            const VacioHTML = `
              <div style="text-align: center; padding: 2.5rem 1rem; color: var(--color-texto-atenuado);">
                <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.4;"></i>
                No se han registrado pagos para este préstamo aún.
              </div>
            `;
            if (CuerpoTabla) CuerpoTabla.innerHTML = `<tr><td colspan="3">${VacioHTML}</td></tr>`;
            if (ContenedorMovil) ContenedorMovil.innerHTML = VacioHTML;
            if (TextoTotal) TextoTotal.textContent = "Bs. 0.00";
            return;
          }

          let TotalAbonado = 0;
          let FilasTablaHTML = "";
          let TarjetasMovilHTML = "";

          ListaPagos.forEach((Pago, Index) => {
            const Monto = Number(Pago.MontoAbonado) || 0;
            TotalAbonado += Monto;

            let FechaFormateada = Pago.FechaPago || "-";
            try {
              const FechaObj = new Date(Pago.FechaPago);
              if (!isNaN(FechaObj.getTime())) {
                FechaFormateada = FechaObj.toLocaleString("es-BO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });
              }
            } catch {
              FechaFormateada = Pago.FechaPago;
            }

            const NroPago = ListaPagos.length - Index;
            const MontoStr = Monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // Fila Escritorio
            FilasTablaHTML += `
              <tr>
                <td><strong>#${NroPago}</strong></td>
                <td><i class="fa-regular fa-clock" style="margin-right: 0.35rem; color: var(--color-texto-atenuado);"></i>${FechaFormateada}</td>
                <td style="text-align: right; font-weight: 700; color: var(--color-exito);">
                  Bs. ${MontoStr}
                </td>
              </tr>
            `;

            // Tarjeta Móvil
            TarjetasMovilHTML += `
              <div class="TarjetaRegistroMovil" style="padding: 0.85rem 1rem; gap: 0.45rem; border-left: 4px solid var(--color-exito);">
                <div class="CabeceraRegistroMovil" style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="Badge Badge-Info" style="font-weight: 700; font-size: 0.775rem;">
                    <i class="fa-solid fa-receipt"></i> Pago #${NroPago}
                  </span>
                  <span style="font-size: 1.05rem; font-weight: 800; color: var(--color-exito);">
                    Bs. ${MontoStr}
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: var(--color-texto-secundario); display: flex; align-items: center; gap: 0.4rem;">
                  <i class="fa-regular fa-clock" style="color: var(--color-texto-atenuado); font-size: 0.8rem;"></i>
                  <span>${FechaFormateada}</span>
                </div>
              </div>
            `;
          });

          if (CuerpoTabla) CuerpoTabla.innerHTML = FilasTablaHTML;
          if (ContenedorMovil) ContenedorMovil.innerHTML = TarjetasMovilHTML;
          if (TextoTotal) {
            TextoTotal.textContent = `Bs. ${TotalAbonado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        } catch (Error) {
          ServicioNotificaciones.MostrarError("Error al cargar historial: " + Error.message);
        }
      }
    });
  }
}
