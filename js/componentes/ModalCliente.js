import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalCliente {
  static Abrir({ Cliente = null, AlGuardar = () => {} }) {
    const EsEdicion = Boolean(Cliente && Cliente.IdDocumento);
    const Titulo = EsEdicion ? "Editar Cliente" : "Nuevo Cliente";

    const OpcionesEstadoCivil = ["Soltero(a)", "Casado(a)", "Divorciado(a)", "Viudo(a)"];
    let OpcionesEstadoCivilHTML = "";
    OpcionesEstadoCivil.forEach((Est) => {
      const Seleccionado = (Cliente && Cliente.EstadoCivil === Est) ? "selected" : "";
      OpcionesEstadoCivilHTML += `<option value="${Est}" ${Seleccionado}>${Est}</option>`;
    });

    const ContenidoHTML = `
      <form id="FormularioCliente" novalidate>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteNombre">Nombre Completo *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-user IconoInput"></i>
              <input type="text" id="InputClienteNombre" class="ControlInput" value="${Cliente ? Cliente.Nombre : ""}" placeholder="Nombre del cliente" required />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteDireccion">Dirección</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-location-dot IconoInput"></i>
              <input type="text" id="InputClienteDireccion" class="ControlInput" value="${Cliente ? (Cliente.Direccion || "") : ""}" placeholder="Av. Principal #123" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteCorreo">Correo Electrónico</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-envelope IconoInput"></i>
              <input type="email" id="InputClienteCorreo" class="ControlInput" value="${Cliente ? (Cliente.Correo || "") : ""}" placeholder="cliente@ejemplo.com" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteCelular">Nro Celular *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-phone IconoInput"></i>
              <input type="tel" id="InputClienteCelular" class="ControlInput" value="${Cliente ? Cliente.Celular : ""}" placeholder="70012345" required />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteNacimiento">Fecha de Nacimiento</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-calendar-days IconoInput"></i>
              <input type="date" id="InputClienteNacimiento" class="ControlInput" value="${Cliente && Cliente.FechaNacimiento ? Cliente.FechaNacimiento.substring(0, 10) : ""}" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="SelectClienteEstadoCivil">Estado Civil *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-heart IconoInput"></i>
              <select id="SelectClienteEstadoCivil" class="ControlInput">
                ${OpcionesEstadoCivilHTML}
              </select>
            </div>
          </div>
        </div>

        ${
          EsEdicion
            ? `
          <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;">
            <input type="checkbox" id="CheckClienteHabilitado" style="width: 18px; height: 18px; accent-color: var(--color-primario);" ${
              Cliente.EstaHabilitado ? "checked" : ""
            } />
            <label for="CheckClienteHabilitado" style="font-weight: 600; font-size: 0.9rem; cursor: pointer;">
              Cliente Habilitado / Activo
            </label>
          </div>
        `
            : ""
        }

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
          <button type="button" class="Boton Boton-Secundario" id="BotonCancelarCliente">Cancelar</button>
          <button type="submit" class="Boton Boton-Primario" id="BotonGuardarCliente">
            <span id="TextoGuardarCliente">${EsEdicion ? "Guardar Cambios" : "Crear Cliente"}</span>
            <div class="Spinner" id="SpinnerCliente" style="display: none;"></div>
          </button>
        </div>
      </form>
    `;

    ComponenteModal.Abrir({
      Titulo,
      ContenidoHTML,
      Tamano: "Grande",
      AlAbrir: (CuerpoEl) => {
        const Formulario = CuerpoEl.querySelector("#FormularioCliente");
        const InputNombre = CuerpoEl.querySelector("#InputClienteNombre");
        const InputDireccion = CuerpoEl.querySelector("#InputClienteDireccion");
        const InputCorreo = CuerpoEl.querySelector("#InputClienteCorreo");
        const InputCelular = CuerpoEl.querySelector("#InputClienteCelular");
        const InputNacimiento = CuerpoEl.querySelector("#InputClienteNacimiento");
        const SelectEstadoCivil = CuerpoEl.querySelector("#SelectClienteEstadoCivil");
        const CheckHab = CuerpoEl.querySelector("#CheckClienteHabilitado");
        const BotonCancelar = CuerpoEl.querySelector("#BotonCancelarCliente");
        const BotonGuardar = CuerpoEl.querySelector("#BotonGuardarCliente");
        const TextoGuardar = CuerpoEl.querySelector("#TextoGuardarCliente");
        const Spinner = CuerpoEl.querySelector("#SpinnerCliente");

        BotonCancelar.addEventListener("click", () => {
          ComponenteModal.Cerrar();
        });

        Formulario.addEventListener("submit", async (e) => {
          e.preventDefault();

          const Nombre = InputNombre.value.trim();
          const Direccion = InputDireccion.value.trim();
          const Correo = InputCorreo.value.trim();
          const Celular = InputCelular.value.trim();
          const FechaNacimiento = InputNacimiento.value || null;
          const EstadoCivil = SelectEstadoCivil.value;
          const EstaHabilitado = CheckHab ? CheckHab.checked : true;

          if (!Nombre || !Celular || !EstadoCivil) {
            ServicioNotificaciones.MostrarAdvertencia("Por favor complete los campos obligatorios (Nombre, Celular, Estado Civil).", "Campos Requeridos");
            return;
          }

          BotonGuardar.disabled = true;
          TextoGuardar.textContent = "Procesando...";
          Spinner.style.display = "inline-block";

          try {
            let Resultado;
            if (EsEdicion) {
              Resultado = await ServicioFirebase.ActualizarCliente(
                Cliente.IdDocumento,
                Nombre,
                FechaNacimiento,
                EstadoCivil,
                Direccion,
                Celular,
                Correo,
                EstaHabilitado
              );
            } else {
              Resultado = await ServicioFirebase.RegistrarCliente(
                Nombre,
                FechaNacimiento,
                EstadoCivil,
                Direccion,
                Celular,
                Correo
              );
            }

            if (Resultado.Exito) {
              ServicioNotificaciones.MostrarExito(Resultado.Mensaje || "Cliente guardado con éxito.");
              ComponenteModal.Cerrar();
              AlGuardar();
            } else {
              ServicioNotificaciones.MostrarError(Resultado.Mensaje || "No se pudo guardar el cliente.");
            }
          } catch (Error) {
            ServicioNotificaciones.MostrarError("Error inesperado: " + Error.message);
          } finally {
            BotonGuardar.disabled = false;
            TextoGuardar.textContent = EsEdicion ? "Guardar Cambios" : "Crear Cliente";
            Spinner.style.display = "none";
          }
        });
      }
    });
  }
}
