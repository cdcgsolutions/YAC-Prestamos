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
}
