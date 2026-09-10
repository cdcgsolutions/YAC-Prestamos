import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalCliente {
  static Abrir({ Cliente = null, AlGuardar = () => {} }) {
    const EsEdicion = Boolean(Cliente && Cliente.IdDocumento);
    const Titulo = EsEdicion 
      ? `<i class="fa-solid fa-user-pen"></i> Editar Cliente` 
      : `<i class="fa-solid fa-user-plus"></i> Nuevo Cliente`;

    const OpcionesEstadoCivil = ["Soltero(a)", "Casado(a)", "Divorciado(a)", "Viudo(a)"];
    let OpcionesEstadoCivilHTML = "";
    OpcionesEstadoCivil.forEach((Est) => {
      const Seleccionado = (Cliente && Cliente.EstadoCivil === Est) ? "selected" : "";
      OpcionesEstadoCivilHTML += `<option value="${Est}" ${Seleccionado}>${Est}</option>`;
    });

    const ContenidoHTML = `
      <form id="FormularioCliente" novalidate>
        <div class="ModalGridForm">
          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteNombre">Nombre Completo *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-user IconoInput"></i>
              <input type="text" id="InputClienteNombre" class="ControlInput" value="${Cliente ? (Cliente.Nombre || "") : ""}" required autocomplete="off" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteCelular">Nro Celular *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-phone IconoInput"></i>
              <input type="tel" id="InputClienteCelular" class="ControlInput" value="${Cliente ? (Cliente.Celular || "") : ""}" required autocomplete="off" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteCorreo">Correo Electrónico</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-envelope IconoInput"></i>
              <input type="email" id="InputClienteCorreo" class="ControlInput" value="${Cliente ? (Cliente.Correo || "") : ""}" autocomplete="off" />
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

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteNacimiento">Fecha de Nacimiento</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-calendar-days IconoInput"></i>
              <input type="date" id="InputClienteNacimiento" class="ControlInput" value="${Cliente && Cliente.FechaNacimiento ? Cliente.FechaNacimiento.substring(0, 10) : ""}" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputClienteDireccion">Dirección</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-location-dot IconoInput"></i>
              <input type="text" id="InputClienteDireccion" class="ControlInput" value="${Cliente ? (Cliente.Direccion || "") : ""}" autocomplete="off" />
            </div>
          </div>
        </div>

        <div class="ModalAcciones">
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
          const EstaHabilitado = Cliente ? Cliente.EstaHabilitado : true;

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
