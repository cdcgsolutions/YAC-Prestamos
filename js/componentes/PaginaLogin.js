import { ServicioFirebase } from "../servicios/ServicioFirebase.js";
import { ServicioSesion } from "../servicios/ServicioSesion.js";
import { ServicioNotificaciones } from "../servicios/ServicioNotificaciones.js";
import { Enrutador } from "../Enrutador.js";

export class PaginaLogin {
  static Renderizar() {
    const ContenedorApp = document.getElementById("App");
    ContenedorApp.innerHTML = `
      <div class="ContenedorLogin">
        <div class="TarjetaLogin">
          <div class="EncabezadoLogin">
            <div class="IconoLogin">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <h1 class="TituloLogin">YAC-Préstamos</h1>
            <p class="SubtituloLogin">Sistema de Gestión y Control Financiero</p>
          </div>

          <form id="FormularioLogin" autocomplete="off" novalidate>
            <div class="GrupoInput">
              <label class="EtiquetaInput" for="InputCorreo">Correo</label>
              <div class="EnvoltorioInput">
                <i class="fa-solid fa-envelope IconoInput"></i>
                <input 
                  type="email" 
                  id="InputCorreo" 
                  class="ControlInput" 
                  autocomplete="off" 
                  value=""
                  required
                />
              </div>
            </div>

            <div class="GrupoInput">
              <label class="EtiquetaInput" for="InputContrasena">Contraseña</label>
              <div class="EnvoltorioInput">
                <i class="fa-solid fa-lock IconoInput"></i>
                <input 
                  type="password" 
                  id="InputContrasena" 
                  class="ControlInput" 
                  autocomplete="new-password" 
                  value=""
                  required
                />
                <button type="button" class="BotonVisibilidadPassword" id="BotonVerPassword" aria-label="Mostrar u ocultar contraseña">
                  <i class="fa-solid fa-eye-slash" id="IconoVerPassword"></i>
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem;">
              <a href="javascript:void(0)" id="EnlaceOlvido" style="font-size: 0.85rem; color: var(--color-primario); font-weight: 600;">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button type="submit" class="Boton Boton-Primario" id="BotonEnviarLogin" style="width: 100%; padding: 0.85rem; font-size: 1rem;">
              <span id="TextoBotonLogin">Iniciar Sesión</span>
              <div class="Spinner" id="SpinnerLogin" style="display: none;"></div>
            </button>
          </form>
        </div>
      </div>
    `;

    this.AdjuntarEventos();
  }

  static AdjuntarEventos() {
    const Formulario = document.getElementById("FormularioLogin");
    const InputCorreo = document.getElementById("InputCorreo");
    const InputContrasena = document.getElementById("InputContrasena");
    const BotonVerPassword = document.getElementById("BotonVerPassword");
    const IconoVer = document.getElementById("IconoVerPassword");
    const BotonEnviar = document.getElementById("BotonEnviarLogin");
    const TextoBoton = document.getElementById("TextoBotonLogin");
    const Spinner = document.getElementById("SpinnerLogin");
    const EnlaceOlvido = document.getElementById("EnlaceOlvido");

    // Limpiar campos para evitar autocompletado del navegador
    if (InputCorreo) InputCorreo.value = "";
    if (InputContrasena) InputContrasena.value = "";
    setTimeout(() => {
      if (InputCorreo) InputCorreo.value = "";
      if (InputContrasena) InputContrasena.value = "";
    }, 100);

    let PasswordVisible = false;
    BotonVerPassword.addEventListener("click", () => {
      PasswordVisible = !PasswordVisible;
      InputContrasena.type = PasswordVisible ? "text" : "password";
      IconoVer.className = PasswordVisible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
    });

    EnlaceOlvido.addEventListener("click", () => {
      ServicioNotificaciones.MostrarInfo("Por favor, contacte a un administrador para restablecer sus credenciales.", "Recuperación de Contraseña");
    });

    Formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const Correo = InputCorreo.value.trim();
      const Contrasena = InputContrasena.value;

      if (!Correo || !Contrasena) {
        ServicioNotificaciones.MostrarAdvertencia("Por favor ingrese su correo y contraseña.", "Campos Requeridos");
        return;
      }

      // Estado cargando
      BotonEnviar.disabled = true;
      TextoBoton.textContent = "Iniciando...";
      Spinner.style.display = "inline-block";

      try {
        const Resultado = await ServicioFirebase.AutenticarUsuario(Correo, Contrasena);

        if (Resultado.Exito && Resultado.Uid) {
          ServicioSesion.GuardarSesion(Resultado.Uid);
          ServicioNotificaciones.MostrarExito("Bienvenido al sistema.", "Inicio Exitoso");
          setTimeout(() => {
            Enrutador.NavegarA("inicio");
          }, 300);
        } else {
          ServicioNotificaciones.MostrarError(Resultado.Mensaje || "Credenciales incorrectas.", "Error de Acceso");
        }
      } catch (Error) {
        ServicioNotificaciones.MostrarError("Ocurrió un error inesperado: " + Error.message, "Error");
      } finally {
        BotonEnviar.disabled = false;
        TextoBoton.textContent = "Iniciar Sesión";
        Spinner.style.display = "none";
      }
    });
  }
}