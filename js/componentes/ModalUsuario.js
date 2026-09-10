import { ComponenteModal } from "./ComponenteModal.js";
import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioSesion } from "../servicios/ServicioSesion.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";

export class ModalUsuario {
  static async Abrir({ Usuario = null, Roles = [], AlGuardar = () => {} }) {
    const EsEdicion = Boolean(Usuario && Usuario.IdDocumento);
    const Titulo = EsEdicion 
      ? `<i class="fa-solid fa-user-pen"></i> Editar Usuario` 
      : `<i class="fa-solid fa-user-plus"></i> Nuevo Usuario`;

    // Obtener usuario actualmente autenticado en el sistema
    const UsuarioLogueado = await ServicioSesion.ObtenerUsuarioActual();
    const EsSuperAdminLogueado = Boolean(UsuarioLogueado && Number(UsuarioLogueado.IdRol) === 1);

    // Al CREAR siempre se muestran todos los campos. Al EDITAR solo se muestran todos si es SuperAdmin.
    const MostrarCamposCompletos = !EsEdicion || EsSuperAdminLogueado;
    const BloquearCorreo = EsEdicion && !EsSuperAdminLogueado;

    // Restricción para Rol 3 (Usuario/Operador): no puede crear ni editar usuarios
    if (UsuarioLogueado && Number(UsuarioLogueado.IdRol) === 3) {
      ServicioNotificaciones.MostrarAdvertencia("Los usuarios no tienen privilegios para crear o editar usuarios.", "Acceso Denegado");
      return;
    }

    // Seguridad jerárquica: Solo SuperAdmin puede editar a un SuperAdmin
    if (EsEdicion && Usuario && Number(Usuario.IdRol) === 1 && !EsSuperAdminLogueado) {
      ServicioNotificaciones.MostrarAdvertencia("No tiene privilegios para modificar la cuenta de un SuperAdmin.", "Acceso Restringido");
      return;
    }

    // Filtrar roles: solo SuperAdmin puede asignar el rol SuperAdmin (Id 1)
    const RolesDisponibles = Roles.filter((Rol) => EsSuperAdminLogueado || Rol.Id !== 1);

    let OpcionesRolesHTML = "";
    RolesDisponibles.forEach((Rol) => {
      const Seleccionado = (Usuario ? Usuario.IdRol === Rol.Id : Rol.Id === 3) ? "selected" : "";
      OpcionesRolesHTML += `<option value="${Rol.Id}" ${Seleccionado}>${Rol.Descripcion}</option>`;
    });

    const ContenidoHTML = `
      <form id="FormularioUsuario" novalidate>
        <div class="ModalGridForm">
          <div class="GrupoInput ${MostrarCamposCompletos ? "" : "ColumnaCompleta"}">
            <label class="EtiquetaInput" for="InputUsuarioNombre">Nombre Completo *</label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-id-badge IconoInput"></i>
              <input type="text" id="InputUsuarioNombre" class="ControlInput" value="${Usuario ? (Usuario.NombreUsuario || "") : ""}" required autocomplete="off" />
            </div>
          </div>

          <div class="GrupoInput ${MostrarCamposCompletos ? "" : "ColumnaCompleta"}">
            <label class="EtiquetaInput" for="InputUsuarioCorreo">
              Correo Electrónico * ${BloquearCorreo ? '<span style="font-size: 0.75rem; color: var(--color-texto-atenuado); font-weight: 400;">(Solo lectura)</span>' : ""}
            </label>
            <div class="EnvoltorioInput">
              <i class="fa-solid fa-envelope IconoInput"></i>
              <input 
                type="email" 
                id="InputUsuarioCorreo" 
                class="ControlInput" 
                value="${Usuario ? (Usuario.CorreoElectronico || "") : ""}" 
                required 
                autocomplete="off" 
                ${BloquearCorreo ? "disabled title='Solo el SuperAdmin puede modificar el correo electrónico'" : ""} 
              />
            </div>
          </div>

          ${
            MostrarCamposCompletos
              ? `
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
      Tamano: MostrarCamposCompletos ? "Grande" : "Normal",
      AlAbrir: (CuerpoEl) => {
        const Formulario = CuerpoEl.querySelector("#FormularioUsuario");
        const InputNombre = CuerpoEl.querySelector("#InputUsuarioNombre");
        const InputCorreo = CuerpoEl.querySelector("#InputUsuarioCorreo");
        const InputPass = CuerpoEl.querySelector("#InputUsuarioContrasena");
        const InputConf = CuerpoEl.querySelector("#InputUsuarioConfirmar");
        const SelectRol = CuerpoEl.querySelector("#SelectUsuarioRol");
        const BotonVer = CuerpoEl.querySelector("#BotonVerPassUsuario");
        const BotonCancelar = CuerpoEl.querySelector("#BotonCancelarUsuario");
        const BotonGuardar = CuerpoEl.querySelector("#BotonGuardarUsuario");
        const TextoGuardar = CuerpoEl.querySelector("#TextoGuardarUsuario");
        const Spinner = CuerpoEl.querySelector("#SpinnerUsuario");

        let PassVisible = false;
        if (BotonVer && InputPass && InputConf) {
          BotonVer.addEventListener("click", () => {
            PassVisible = !PassVisible;
            InputPass.type = PassVisible ? "text" : "password";
            InputConf.type = PassVisible ? "text" : "password";
            BotonVer.innerHTML = PassVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
          });
        }

        BotonCancelar.addEventListener("click", () => {
          ComponenteModal.Cerrar();
        });

        Formulario.addEventListener("submit", async (e) => {
          e.preventDefault();

          const Nombre = InputNombre.value.trim();
          const Correo = BloquearCorreo && Usuario ? Usuario.CorreoElectronico : InputCorreo.value.trim();
          const Contrasena = InputPass ? InputPass.value : (Usuario ? Usuario.Contrasena : "");
          const Confirmacion = InputConf ? InputConf.value : Contrasena;
          const IdRol = SelectRol ? (parseInt(SelectRol.value, 10) || 3) : (Usuario ? Usuario.IdRol : 3);
          const EstaHabilitado = Usuario ? Usuario.EstaHabilitado : true;

          if (!Nombre || !Correo) {
            ServicioNotificaciones.MostrarAdvertencia("Por favor complete todos los campos obligatorios.", "Campos Requeridos");
            return;
          }

          if (MostrarCamposCompletos) {
            if (!Contrasena) {
              ServicioNotificaciones.MostrarAdvertencia("Por favor ingrese la contraseña.", "Contraseña Requerida");
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
