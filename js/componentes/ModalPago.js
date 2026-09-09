import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalPago {
  static Abrir({ Prestamo, AlGuardar = () => {} }) {
    if (!Prestamo) return;

    const ContenidoHTML = `
      <form id="FormularioPago" novalidate>
        <div style="background-color: var(--color-superficie-hover); border: 1px solid var(--color-borde); border-radius: var(--radio-lg); padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.85rem; color: var(--color-texto-secundario); margin-bottom: 0.25rem;">Cliente</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-texto-primario);">${Prestamo.NombreCliente}</div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.85rem; border-top: 1px solid var(--color-borde); padding-top: 0.85rem;">
            <span style="color: var(--color-texto-secundario); font-size: 0.9rem; font-weight: 600;">Saldo Pendiente:</span>
            <span style="color: var(--color-peligro); font-weight: 800; font-size: 1.25rem;">
              Bs. ${Number(Prestamo.SaldoPendiente).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div class="GrupoInput">
          <label class="EtiquetaInput" for="InputMontoAbonar">Monto a Abonar (Bs.) *</label>
          <div class="EnvoltorioInput">
            <i class="fa-solid fa-money-bill-transfer IconoInput"></i>
            <input 
              type="number" 
              id="InputMontoAbonar" 
              class="ControlInput" 
              value="${Prestamo.SaldoPendiente}" 
              min="0.01" 
              max="${Prestamo.SaldoPendiente}" 
              step="any" 
              required 
            />
          </div>
        </div>

        <div class="ModalAcciones">
          <button type="button" class="Boton Boton-Secundario" id="BotonCancelarPago">Cancelar</button>
          <button type="submit" class="Boton Boton-Primario" id="BotonConfirmarPago">
            <span id="TextoConfirmarPago">Registrar Abono</span>
            <div class="Spinner" id="SpinnerPago" style="display: none;"></div>
          </button>
        </div>
      </form>
    `;

    ComponenteModal.Abrir({
      Titulo: `<i class="fa-solid fa-receipt"></i> Registrar Pago de Cuota`,
      ContenidoHTML,
      Tamano: "Pequeno",
      AlAbrir: (CuerpoEl) => {
        const Formulario = CuerpoEl.querySelector("#FormularioPago");
        const InputMonto = CuerpoEl.querySelector("#InputMontoAbonar");
        const BotonCancelar = CuerpoEl.querySelector("#BotonCancelarPago");
        const BotonConfirmar = CuerpoEl.querySelector("#BotonConfirmarPago");
        const TextoConfirmar = CuerpoEl.querySelector("#TextoConfirmarPago");
        const Spinner = CuerpoEl.querySelector("#SpinnerPago");

        BotonCancelar.addEventListener("click", () => {
          ComponenteModal.Cerrar();
        });

        Formulario.addEventListener("submit", async (e) => {
          e.preventDefault();

          const MontoAbonado = parseFloat(InputMonto.value) || 0;
          const SaldoMax = Number(Prestamo.SaldoPendiente);

          if (MontoAbonado <= 0) {
            ServicioNotificaciones.MostrarAdvertencia("El monto debe ser mayor a 0.", "Monto Requerido");
            return;
          }

          if (MontoAbonado > SaldoMax) {
            ServicioNotificaciones.MostrarAdvertencia(`El monto no puede superar el saldo pendiente (Bs. ${SaldoMax.toFixed(2)}).`, "Monto Excedido");
            return;
          }

          BotonConfirmar.disabled = true;
          TextoConfirmar.textContent = "Procesando...";
          Spinner.style.display = "inline-block";

          try {
            const Resultado = await ServicioFirebase.RegistrarPago(Prestamo.IdDocumento, MontoAbonado);
            if (Resultado.Exito) {
              ServicioNotificaciones.MostrarExito(Resultado.Mensaje || "Pago registrado exitosamente.");
              ComponenteModal.Cerrar();
              AlGuardar();
            } else {
              ServicioNotificaciones.MostrarError(Resultado.Mensaje || "Error al registrar el pago.");
            }
          } catch (Error) {
            ServicioNotificaciones.MostrarError("Error inesperado: " + Error.message);
          } finally {
            BotonConfirmar.disabled = false;
            TextoConfirmar.textContent = "Registrar Abono";
            Spinner.style.display = "none";
          }
        });
      }
    });
  }
}
