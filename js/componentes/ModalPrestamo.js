import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalPrestamo {
  static Abrir({ Prestamo = null, Clientes = [], AlGuardar = () => {} }) {
    const EsEdicion = Boolean(Prestamo && Prestamo.IdDocumento);
    if (EsEdicion && (Prestamo.Estado === "Pagado" || Prestamo.Estado === "Completado" || Number(Prestamo.SaldoPendiente) <= 0)) {
      ServicioNotificaciones.MostrarAdvertencia("Este préstamo ya está pagado y completado; no se permite su edición.", "Préstamo Liquidado");
      return;
    }
    const Titulo = EsEdicion 
      ? `<i class="fa-solid fa-file-pen"></i> Editar Préstamo` 
      : `<i class="fa-solid fa-hand-holding-dollar"></i> Nuevo Préstamo`;

    let OpcionesClientesHTML = '<option value="" disabled selected>Seleccione un cliente...</option>';
    Clientes.filter((c) => c.EstaHabilitado).forEach((Cli) => {
      const Seleccionado = (Prestamo && Prestamo.IdCliente === Cli.Id) ? "selected" : "";
      OpcionesClientesHTML += `<option value="${Cli.Id}" ${Seleccionado}>${Cli.Nombre}</option>`;
    });

    const Modalidades = ["Diario", "Semanal", "Quincenal", "Mensual"];
    let OpcionesModalidadHTML = "";
    Modalidades.forEach((Mod) => {
      const Seleccionado = (Prestamo ? Prestamo.ModalidadCobro === Mod : Mod === "Mensual") ? "selected" : "";
      OpcionesModalidadHTML += `<option value="${Mod}" ${Seleccionado}>${Mod}</option>`;
    });

    const Estados = ["Activo", "Completado", "Cancelado"];
    let OpcionesEstadoHTML = "";
    Estados.forEach((Est) => {
      const Seleccionado = (Prestamo && Prestamo.Estado === Est) ? "selected" : "";
      OpcionesEstadoHTML += `<option value="${Est}" ${Seleccionado}>${Est}</option>`;
    });

    const MontoInicial = Prestamo ? Prestamo.Monto : 1000;
    const InteresInicial = Prestamo ? Prestamo.PorcentajeInteres : 10;
    const MontoTotalInicial = MontoInicial + (MontoInicial * (InteresInicial / 100));

    const ContenidoHTML = `
      <form id="FormularioPrestamo" novalidate>
        <div class="ModalGridForm">
          <div class="GrupoInput ColumnaCompleta">
            <label class="EtiquetaInput" for="SelectPrestamoCliente">Cliente *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-user-tag IconoInput"></i>
              <select id="SelectPrestamoCliente" class="ControlInput" required ${EsEdicion ? "disabled" : ""}>
                ${OpcionesClientesHTML}
              </select>
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputPrestamoMonto">Monto del Préstamo (Bs.) *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-money-bill-wave IconoInput"></i>
              <input type="number" id="InputPrestamoMonto" class="ControlInput" value="${MontoInicial}" min="1" step="any" required />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputPrestamoInteres">Interés (%) *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-percent IconoInput"></i>
              <input type="number" id="InputPrestamoInteres" class="ControlInput" value="${InteresInicial}" min="0" max="100" step="any" required />
            </div>
          </div>

          <div class="GrupoInput ${EsEdicion ? "" : "ColumnaCompleta"}">
            <label class="EtiquetaInput" for="SelectPrestamoModalidad">Modalidad de Cobro *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-calendar-check IconoInput"></i>
              <select id="SelectPrestamoModalidad" class="ControlInput">
                ${OpcionesModalidadHTML}
              </select>
            </div>
          </div>

          ${
            EsEdicion
              ? `
            <div class="GrupoInput">
              <label class="EtiquetaInput" for="SelectPrestamoEstado">Estado del Préstamo *</label>
              <div class="EnvoltorioInput">
                <i class="fa-solid fa-signal IconoInput"></i>
                <select id="SelectPrestamoEstado" class="ControlInput">
                  ${OpcionesEstadoHTML}
                </select>
              </div>
            </div>
          `
              : ""
          }

          <div class="ColumnaCompleta">
            <div class="ModalResumenBox">
              <div>
                <div class="Etiqueta">Monto Total a Pagar (Capital + Interés)</div>
                <div class="Valor" id="TextoMontoTotalCalculado">
                  Bs. ${MontoTotalInicial.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div class="Icono">
                <i class="fa-solid fa-calculator"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="ModalAcciones">
          <button type="button" class="Boton Boton-Secundario" id="BotonCancelarPrestamo">Cancelar</button>
          <button type="submit" class="Boton Boton-Primario" id="BotonGuardarPrestamo">
            <span id="TextoGuardarPrestamo">${EsEdicion ? "Guardar Cambios" : "Crear Préstamo"}</span>
            <div class="Spinner" id="SpinnerPrestamo" style="display: none;"></div>
          </button>
        </div>
      </form>
    `;

    ComponenteModal.Abrir({
      Titulo,
      ContenidoHTML,
      Tamano: "Grande",
      AlAbrir: (CuerpoEl) => {
        const Formulario = CuerpoEl.querySelector("#FormularioPrestamo");
        const SelectCliente = CuerpoEl.querySelector("#SelectPrestamoCliente");
        const InputMonto = CuerpoEl.querySelector("#InputPrestamoMonto");
        const InputInteres = CuerpoEl.querySelector("#InputPrestamoInteres");
        const SelectModalidad = CuerpoEl.querySelector("#SelectPrestamoModalidad");
        const SelectEstado = CuerpoEl.querySelector("#SelectPrestamoEstado");
        const TextoTotal = CuerpoEl.querySelector("#TextoMontoTotalCalculado");
        const BotonCancelar = CuerpoEl.querySelector("#BotonCancelarPrestamo");
        const BotonGuardar = CuerpoEl.querySelector("#BotonGuardarPrestamo");
        const TextoGuardar = CuerpoEl.querySelector("#TextoGuardarPrestamo");
        const Spinner = CuerpoEl.querySelector("#SpinnerPrestamo");

        const RecalcularTotal = () => {
          const Monto = parseFloat(InputMonto.value) || 0;
          const Interes = parseFloat(InputInteres.value) || 0;
          const Total = Monto + (Monto * (Interes / 100));
          TextoTotal.textContent = `Bs. ${Total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          return Total;
        };

        InputMonto.addEventListener("input", RecalcularTotal);
        InputInteres.addEventListener("input", RecalcularTotal);

        BotonCancelar.addEventListener("click", () => {
          ComponenteModal.Cerrar();
        });

        Formulario.addEventListener("submit", async (e) => {
          e.preventDefault();

          const IdCliente = parseInt(SelectCliente.value, 10);
          const Monto = parseFloat(InputMonto.value) || 0;
          const Interes = parseFloat(InputInteres.value) || 0;
          const ModalidadCobro = SelectModalidad.value;
          const Estado = SelectEstado ? SelectEstado.value : "Activo";

          if (!IdCliente && !EsEdicion) {
            ServicioNotificaciones.MostrarAdvertencia("Por favor seleccione un cliente.", "Cliente Requerido");
            return;
          }

          if (Monto <= 0) {
            ServicioNotificaciones.MostrarAdvertencia("El monto debe ser mayor a 0.", "Monto Inválido");
            return;
          }

          const MontoTotal = Monto + (Monto * (Interes / 100));
          const ClienteSeleccionado = Clientes.find((c) => c.Id === IdCliente);
          const NombreCliente = ClienteSeleccionado ? ClienteSeleccionado.Nombre : (Prestamo ? Prestamo.NombreCliente : "Desconocido");

          // Si es nuevo, el saldo pendiente es el total
          const SaldoPendiente = EsEdicion ? Math.min(Prestamo.SaldoPendiente, MontoTotal) : MontoTotal;

          BotonGuardar.disabled = true;
          TextoGuardar.textContent = "Procesando...";
          Spinner.style.display = "inline-block";

          try {
            let Resultado;
            if (EsEdicion) {
              Resultado = await ServicioFirebase.ActualizarPrestamo(
                Prestamo.IdDocumento,
                Prestamo.IdCliente,
                NombreCliente,
                Monto,
                Interes,
                MontoTotal,
                SaldoPendiente,
                ModalidadCobro,
                Estado
              );
            } else {
              Resultado = await ServicioFirebase.RegistrarPrestamo(
                IdCliente,
                NombreCliente,
                Monto,
                Interes,
                MontoTotal,
                SaldoPendiente,
                ModalidadCobro,
                Estado
              );
            }

            if (Resultado.Exito) {
              ServicioNotificaciones.MostrarExito(Resultado.Mensaje || "Préstamo registrado con éxito.");
              ComponenteModal.Cerrar();
              AlGuardar();
            } else {
              ServicioNotificaciones.MostrarError(Resultado.Mensaje || "No se pudo guardar el préstamo.");
            }
          } catch (Error) {
            ServicioNotificaciones.MostrarError("Error inesperado: " + Error.message);
          } finally {
            BotonGuardar.disabled = false;
            TextoGuardar.textContent = EsEdicion ? "Guardar Cambios" : "Crear Préstamo";
            Spinner.style.display = "none";
          }
        });
      }
    });
  }
}
