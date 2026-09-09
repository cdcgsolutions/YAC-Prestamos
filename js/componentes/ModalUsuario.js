import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalUsuario {
  static Abrir({ Usuario = null, Roles = [], AlGuardar = () => {} }) {
    const EsEdicion = Boolean(Usuario && Usuario.IdDocumento);
    const Titulo = EsEdicion 
      ? `<i class="fa-solid fa-user-pen"></i> Editar Usuario` 
      : `<i class="fa-solid fa-user-plus"></i> Nuevo Usuario`;

    let OpcionesRolesHTML = "";
    Roles.forEach((Rol) => {
      const Seleccionado = (Usuario ? Usuario.IdRol === Rol.Id : Rol.Id === 3) ? "selected" : "";
      OpcionesRolesHTML += `<option value="${Rol.Id}" ${Seleccionado}>${Rol.Descripcion}</option>`;
    });

    const ContenidoHTML = `
      <form id="FormularioUsuario" novalidate>
        <div class="ModalGridForm">
          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputUsuarioNombre">Nombre Completo *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-id-badge IconoInput"></i>
              <input type="text" id="InputUsuarioNombre" class="ControlInput" value="${Usuario ? (Usuario.NombreUsuario || "") : ""}" required autocomplete="off" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputUsuarioCorreo">Correo Electrónico *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-envelope IconoInput"></i>
              <input type="email" id="InputUsuarioCorreo" class="ControlInput" value="${Usuario ? (Usuario.CorreoElectronico || "") : ""}" required autocomplete="off" />
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputUsuarioContrasena">Contraseña *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-lock IconoInput"></i>
              <input type="password" id="InputUsuarioContrasena" class="ControlInput" value="${Usuario ? (Usuario.Contrasena || "") : ""}" required autocomplete="new-password" />
              <button type="button" class="BotonVisibilidadPassword" id="BotonVerPassUsuario" aria-label="Mostrar contraseña">
                <i class="fa-solid fa-eye-slash"></i>
              </button>
            </div>
          </div>

          <div class="GrupoInput">
            <label class="EtiquetaInput" for="InputUsuarioConfirmar">Confirmar Contraseña *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-lock IconoInput"></i>
              <input type="password" id="InputUsuarioConfirmar" class="ControlInput" value="${Usuario ? (Usuario.Contrasena || "") : ""}" required autocomplete="new-password" />
            </div>
          </div>

          <div class="GrupoInput ColumnaCompleta">
            <label class="EtiquetaInput" for="SelectUsuarioRol">Rol de Usuario *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-user-shield IconoInput"></i>
              <select id="SelectUsuarioRol" class="ControlInput">
                ${OpcionesRolesHTML}
              </select>
            </div>
          </div>

          ${
            EsEdicion
              ? `
            <div class="ColumnaCompleta">
              <div class="ModalCheckbox">
                <input type="checkbox" id="CheckUsuarioHabilitado" ${Usuario.EstaHabilitado ? "checked" : ""} />
                <label for="CheckUsuarioHabilitado">Usuario Habilitado / Activo</label>
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div class="ModalAcciones">
          <button type="button" class="Boton Boton-Secundario" id="BotonCancelarUsuario">Cancelar</button>
          <button type="submit" class="Boton Boton-Primario" id="BotonGuardarUsuario">
            <span id="TextoGuardarUsuario">${EsEdicion ? "Guardar Cambios" : "Crear Usuario"}</span>
            <div class="Spinner" id="SpinnerUsuario" style="display: none;"></div>
          </button>
        </div>
      </form>
    `;

    ComponenteModal.Abrir({
      Titulo,
      ContenidoHTML,
      Tamano: "Grande",
      AlAbrir: (CuerpoEl) => {
        const Formulario = CuerpoEl.querySelector("#FormularioUsuario");
        const InputNombre = CuerpoEl.querySelector("#InputUsuarioNombre");
        const InputCorreo = CuerpoEl.querySelector("#InputUsuarioCorreo");
        const InputPass = CuerpoEl.querySelector("#InputUsuarioContrasena");
        const InputConf = CuerpoEl.querySelector("#InputUsuarioConfirmar");
        const SelectRol = CuerpoEl.querySelector("#SelectUsuarioRol");
        const CheckHab = CuerpoEl.querySelector("#CheckUsuarioHabilitado");
        const BotonVer = CuerpoEl.querySelector("#BotonVerPassUsuario");
        const BotonCancelar = CuerpoEl.querySelector("#BotonCancelarUsuario");
        const BotonGuardar = CuerpoEl.querySelector("#BotonGuardarUsuario");
        const TextoGuardar = CuerpoEl.querySelector("#TextoGuardarUsuario");
        const Spinner = CuerpoEl.querySelector("#SpinnerUsuario");

        let PassVisible = false;
        BotonVer.addEventListener("click", () => {
          PassVisible = !PassVisible;
          InputPass.type = PassVisible ? "text" : "password";
          InputConf.type = PassVisible ? "text" : "password";
          BotonVer.innerHTML = PassVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        });

        BotonCancelar.addEventListener("click", () => {
          ComponenteModal.Cerrar();
        });

        Formulario.addEventListener("submit", async (e) => {
          e.preventDefault();

          const Nombre = InputNombre.value.trim();
          const Correo = InputCorreo.value.trim();
          const Contrasena = InputPass.value;
          const Confirmacion = InputConf.value;
          const IdRol = parseInt(SelectRol.value, 10) || 3;
          const EstaHabilitado = CheckHab ? CheckHab.checked : true;

          if (!Nombre || !Correo || !Contrasena) {
            ServicioNotificaciones.MostrarAdvertencia("Por favor complete todos los campos obligatorios.", "Campos Requeridos");
            return;
          }

          if (Contrasena !== Confirmacion) {
            ServicioNotificaciones.MostrarError("Las contraseñas no coinciden.", "Error");
            return;
          }

          // Validación de contraseña segura
          const RegexPass = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/;
          if (!RegexPass.test(Contrasena)) {
            ServicioNotificaciones.MostrarAdvertencia("La contraseña debe tener al menos 6 caracteres, incluir letras, números y al menos un carácter especial.", "Contraseña Insegura");
            return;
          }

          BotonGuardar.disabled = true;
          TextoGuardar.textContent = "Procesando...";
          Spinner.style.display = "inline-block";

          try {
            let Resultado;
            if (EsEdicion) {
              Resultado = await ServicioFirebase.ActualizarUsuario(Usuario.IdDocumento, Nombre, Correo, Contrasena, EstaHabilitado, IdRol);
            } else {
              Resultado = await ServicioFirebase.RegistrarUsuario(Nombre, Correo, Contrasena, EstaHabilitado, IdRol);
            }

            if (Resultado.Exito) {
              ServicioNotificaciones.MostrarExito(Resultado.Mensaje || "Operación completada con éxito.");
              ComponenteModal.Cerrar();
              AlGuardar();
            } else {
              ServicioNotificaciones.MostrarError(Resultado.Mensaje || "No se pudo guardar el usuario.");
            }
          } catch (Error) {
            ServicioNotificaciones.MostrarError("Error inesperado: " + Error.message);
          } finally {
            BotonGuardar.disabled = false;
            TextoGuardar.textContent = EsEdicion ? "Guardar Cambios" : "Crear Usuario";
            Spinner.style.display = "none";
          }
        });
      }
    });
  }
}
