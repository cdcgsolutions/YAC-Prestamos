export class ComponenteModal {
  static ContenedorModalId = "ContenedorModalGlobal";
  static InstanciaActiva = null;

  static AsegurarEstructura() {
    let Contenedor = document.getElementById(this.ContenedorModalId);
    if (!Contenedor) {
      Contenedor = document.createElement("div");
      Contenedor.id = this.ContenedorModalId;
      Contenedor.className = "ModalOverlay";
      Contenedor.innerHTML = `
        <div class="ModalVentana" id="VentanaModalInterna">
          <div class="ModalHeader">
            <h3 class="ModalTitulo" id="TituloModalGlobal">Modal</h3>
            <button class="ModalCerrar" id="BotonCerrarModalGlobal" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="ModalBody" id="CuerpoModalGlobal"></div>
          <div class="ModalFooter" id="PieModalGlobal" style="display: none;"></div>
        </div>
      `;
      document.body.appendChild(Contenedor);

      // Cerrar al hacer clic en el backdrop
      Contenedor.addEventListener("click", (e) => {
        if (e.target === Contenedor) {
          ComponenteModal.Cerrar();
        }
      });

      document.getElementById("BotonCerrarModalGlobal").addEventListener("click", () => {
        ComponenteModal.Cerrar();
      });

      // Cerrar con Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && Contenedor.classList.contains("Abierto")) {
          ComponenteModal.Cerrar();
        }
      });
    }
    return Contenedor;
  }

  static Abrir({
    Titulo = "Modal",
    ContenidoHTML = "",
    Tamano = "Normal", // "Normal", "Grande", "Pequeno"
    AlCerrar = null,
    AlAbrir = null,
    BotonesPieHTML = null
  }) {
    const Contenedor = this.AsegurarEstructura();
    const TituloEl = document.getElementById("TituloModalGlobal");
    const CuerpoEl = document.getElementById("CuerpoModalGlobal");
    const PieEl = document.getElementById("PieModalGlobal");
    const VentanaEl = document.getElementById("VentanaModalInterna");

    TituloEl.textContent = Titulo;
    CuerpoEl.innerHTML = ContenidoHTML;

    // Tamaño
    VentanaEl.className = "ModalVentana";
    if (Tamano === "Grande") VentanaEl.classList.add("Grande");
    if (Tamano === "Pequeno") VentanaEl.classList.add("Pequeno");

    // Pie
    if (BotonesPieHTML) {
      PieEl.innerHTML = BotonesPieHTML;
      PieEl.style.display = "flex";
    } else {
      PieEl.innerHTML = "";
      PieEl.style.display = "none";
    }

    this.InstanciaActiva = { AlCerrar };

    // Mostrar
    document.body.style.overflow = "hidden";
    Contenedor.classList.add("Abierto");

    if (typeof AlAbrir === "function") {
      AlAbrir(CuerpoEl);
    }
  }

  static Cerrar() {
    const Contenedor = document.getElementById(this.ContenedorModalId);
    if (Contenedor) {
      Contenedor.classList.remove("Abierto");
      document.body.style.overflow = "";

      if (this.InstanciaActiva && typeof this.InstanciaActiva.AlCerrar === "function") {
        this.InstanciaActiva.AlCerrar();
      }
      this.InstanciaActiva = null;
    }
  }
}
