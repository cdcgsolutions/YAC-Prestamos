export class ServicioNotificaciones {
  static ContenedorId = "ContenedorToasts";

  static AsegurarContenedor() {
    let Contenedor = document.getElementById(this.ContenedorId);
    if (!Contenedor) {
      Contenedor = document.createElement("div");
      Contenedor.id = this.ContenedorId;
      Contenedor.className = "ContenedorToasts";
      document.body.appendChild(Contenedor);
    }
    return Contenedor;
  }

  static Mostrar(Mensaje, Tipo = "Info", Titulo = null, DuracionMs = 3000) {
    const Contenedor = this.AsegurarContenedor();
    const ElementoToast = document.createElement("div");
    ElementoToast.className = `Toast ${Tipo}`;

    let IconoClase = "fa-solid fa-circle-info";
    let TituloDefault = "Información";

    if (Tipo === "Exito") {
      IconoClase = "fa-solid fa-circle-check";
      TituloDefault = "Éxito";
    } else if (Tipo === "Error") {
      IconoClase = "fa-solid fa-circle-xmark";
      TituloDefault = "Error";
    } else if (Tipo === "Advertencia") {
      IconoClase = "fa-solid fa-triangle-exclamation";
      TituloDefault = "Advertencia";
    }

    ElementoToast.innerHTML = `
      <div class="ToastIcono"><i class="${IconoClase}"></i></div>
      <div class="ToastContenido">
        <div class="ToastTitulo">${Titulo || TituloDefault}</div>
        <div class="ToastMensaje">${Mensaje}</div>
      </div>
      <button class="ToastCerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      <div class="ToastBarraProgreso" style="animation-duration: ${DuracionMs}ms;"></div>
    `;

    const BotonCerrar = ElementoToast.querySelector(".ToastCerrar");
    const RemoverToast = () => {
      ElementoToast.style.opacity = "0";
      ElementoToast.style.transform = "translateX(50px)";
      ElementoToast.style.transition = "all 0.25s ease";
      setTimeout(() => ElementoToast.remove(), 250);
    };

    BotonCerrar.addEventListener("click", RemoverToast);
    Contenedor.appendChild(ElementoToast);

    setTimeout(() => {
      if (ElementoToast.parentElement) {
        RemoverToast();
      }
    }, DuracionMs);
  }

  static MostrarExito(Mensaje, Titulo = "Éxito") {
    this.Mostrar(Mensaje, "Exito", Titulo);
  }

  static MostrarError(Mensaje, Titulo = "Error") {
    this.Mostrar(Mensaje, "Error", Titulo);
  }

  static MostrarAdvertencia(Mensaje, Titulo = "Advertencia") {
    this.Mostrar(Mensaje, "Advertencia", Titulo);
  }

  static MostrarInfo(Mensaje, Titulo = "Información") {
    this.Mostrar(Mensaje, "Info", Titulo);
  }

  /**
   * Diálogo de confirmación interactivo (Equivalente al Confirmacion de Blazor)
   * @param {string|object} Opciones - Título o configuración del diálogo
   * @param {string} [Mensaje] - Mensaje descriptivo
   * @param {string} [Icono] - "warning", "danger", "question", "success", "info"
   * @returns {Promise<boolean>}
   */
  static Confirmar(Opciones, Mensaje = "Esta acción no se puede deshacer.", Icono = "warning") {
    let Titulo = "¿Estás seguro?";
    let TextoConfirmar = "Confirmar";
    let TextoCancelar = "Cancelar";
    let ColorBoton = "Primario";

    if (typeof Opciones === "object" && Opciones !== null) {
      Titulo = Opciones.Titulo || Titulo;
      Mensaje = Opciones.Mensaje || Mensaje;
      Icono = Opciones.Icono || Icono;
      TextoConfirmar = Opciones.TextoConfirmar || TextoConfirmar;
      TextoCancelar = Opciones.TextoCancelar || TextoCancelar;
      ColorBoton = Opciones.ColorBoton || ColorBoton;
    } else if (typeof Opciones === "string") {
      Titulo = Opciones;
    }

    return new Promise((resolve) => {
      const TemaActual = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "light";

      let IconoClass = "fa-solid fa-triangle-exclamation";
      let ClaseColor = "Warning";

      const IconoLower = (Icono || "").toLowerCase();
      if (IconoLower === "danger" || IconoLower === "error" || IconoLower === "peligro") {
        IconoClass = "fa-solid fa-circle-exclamation";
        ClaseColor = "Danger";
        if (ColorBoton === "Primario") ColorBoton = "Peligro";
      } else if (IconoLower === "question" || IconoLower === "pregunta") {
        IconoClass = "fa-solid fa-circle-question";
        ClaseColor = "Question";
      } else if (IconoLower === "success" || IconoLower === "exito") {
        IconoClass = "fa-solid fa-circle-check";
        ClaseColor = "Success";
      } else if (IconoLower === "info" || IconoLower === "informacion") {
        IconoClass = "fa-solid fa-circle-info";
        ClaseColor = "Info";
      } else if (IconoLower === "warning" || IconoLower === "advertencia") {
        IconoClass = "fa-solid fa-triangle-exclamation";
        ClaseColor = "Warning";
        if (ColorBoton === "Primario") ColorBoton = "Peligro";
      }

      const Overlay = document.createElement("div");
      Overlay.className = "ModalOverlay ModalOverlayConfirmacion Abierto";
      Overlay.setAttribute("data-theme", TemaActual);

      const BotonClase = ColorBoton === "Peligro" ? "Boton-Peligro" : "Boton-Primario";

      Overlay.innerHTML = `
        <div class="ModalVentana ModalConfirmacionVentana">
          <div class="ModalConfirmacionIcono ${ClaseColor}">
            <i class="${IconoClass}"></i>
          </div>
          <h3 class="ModalConfirmacionTitulo">${Titulo}</h3>
          <p class="ModalConfirmacionMensaje">${Mensaje}</p>
          <div class="ModalConfirmacionAcciones">
            <button type="button" class="Boton Boton-Secundario" id="BotonConfirmacionCancelar">
              ${TextoCancelar}
            </button>
            <button type="button" class="Boton ${BotonClase}" id="BotonConfirmacionAceptar">
              ${TextoConfirmar}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(Overlay);

      const Cerrar = (Resultado) => {
        Overlay.classList.remove("Abierto");
        setTimeout(() => {
          if (Overlay.parentElement) Overlay.remove();
          document.removeEventListener("keydown", ManejarEscape);
        }, 200);
        resolve(Resultado);
      };

      const ManejarEscape = (e) => {
        if (e.key === "Escape") Cerrar(false);
      };

      Overlay.querySelector("#BotonConfirmacionAceptar").addEventListener("click", () => Cerrar(true));
      Overlay.querySelector("#BotonConfirmacionCancelar").addEventListener("click", () => Cerrar(false));

      Overlay.addEventListener("click", (e) => {
        if (e.target === Overlay) Cerrar(false);
      });

      document.addEventListener("keydown", ManejarEscape);

      setTimeout(() => {
        const Btn = Overlay.querySelector("#BotonConfirmacionAceptar");
        if (Btn) Btn.focus();
      }, 50);
    });
  }
}

export const Confirmacion = (...args) => ServicioNotificaciones.Confirmar(...args);
