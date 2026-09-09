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
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-texto-primario);">${Prestamo.NombreCliente}</div>
        </div>
        <div class="Badge Badge-Info" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
          <i class="fa-solid fa-hashtag"></i> Préstamo #${Prestamo.Id || Prestamo.IdDocumento}
        </div>
      </div>

      <div class="TablaResponsiva" style="max-height: 380px; overflow-y: auto; border: 1px solid var(--color-borde); border-radius: var(--radio-md);">
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

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-borde);">
        <span style="font-weight: 600; color: var(--color-texto-secundario);">Total Abonado a la Fecha:</span>
        <span id="TextoTotalAbonadoHistorial" style="font-size: 1.25rem; font-weight: 800; color: var(--color-primario);">Bs. 0.00</span>
      </div>
    `;

    ComponenteModal.Abrir({
      Titulo: `<i class="fa-solid fa-clock-rotate-left"></i> Historial de Pagos`,
      ContenidoHTML,
      Tamano: "Ancho",
      BotonesPieHTML: `
        <button type="button" class="Boton Boton-Secundario" onclick="document.getElementById('BotonCerrarModalGlobal').click()">Cerrar</button>
      `,
      AlAbrir: async (CuerpoEl) => {
        const CuerpoTabla = CuerpoEl.querySelector("#CuerpoHistorialPagos");
        const TextoTotal = CuerpoEl.querySelector("#TextoTotalAbonadoHistorial");

        try {
          const Respuesta = await ServicioFirebase.ObtenerPagosPorPrestamo(Prestamo.IdDocumento);
          const ListaPagos = Respuesta.Datos || [];

          if (ListaPagos.length === 0) {
            CuerpoTabla.innerHTML = `
              <tr>
                <td colspan="3" style="text-align: center; padding: 2.5rem 1rem; color: var(--color-texto-atenuado);">
                  <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.4;"></i>
                  No se han registrado pagos para este préstamo aún.
                </td>
              </tr>
            `;
            TextoTotal.textContent = "Bs. 0.00";
            return;
          }

          let TotalAbonado = 0;
          let FilasHTML = "";

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

            FilasHTML += `
              <tr>
                <td><strong>#${ListaPagos.length - Index}</strong></td>
                <td><i class="fa-regular fa-clock" style="margin-right: 0.35rem; color: var(--color-texto-atenuado);"></i>${FechaFormateada}</td>
                <td style="text-align: right; font-weight: 700; color: var(--color-exito);">
                  Bs. ${Monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            `;
          });

          CuerpoTabla.innerHTML = FilasHTML;
          TextoTotal.textContent = `Bs. ${TotalAbonado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } catch (Error) {
          ServicioNotificaciones.MostrarError("Error al cargar historial: " + Error.message);
        }
      }
    });
  }
}
