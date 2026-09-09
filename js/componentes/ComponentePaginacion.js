export class ComponentePaginacion {
  static Renderizar({
    PaginaActual = 1,
    TotalPaginas = 1,
    AlCambiarPagina = () => {}
  }) {
    if (TotalPaginas <= 1) return "";

    let HtmlBotones = `
      <div class="ContenedorPaginacion">
        <button class="BotonPagina" data-pagina="${PaginaActual - 1}" ${PaginaActual === 1 ? "disabled" : ""} aria-label="Anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= TotalPaginas; i++) {
      if (
        i === 1 ||
        i === TotalPaginas ||
        (i >= PaginaActual - 1 && i <= PaginaActual + 1)
      ) {
        HtmlBotones += `
          <button class="BotonPagina ${i === PaginaActual ? "Activo" : ""}" data-pagina="${i}">
            ${i}
          </button>
        `;
      } else if (
        i === PaginaActual - 2 ||
        i === PaginaActual + 2
      ) {
        HtmlBotones += `<span style="padding: 0 0.25rem; color: var(--color-texto-atenuado);">...</span>`;
      }
    }

    HtmlBotones += `
        <button class="BotonPagina" data-pagina="${PaginaActual + 1}" ${PaginaActual === TotalPaginas ? "disabled" : ""} aria-label="Siguiente">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    return HtmlBotones;
  }

  static AdjuntarEventos(ContenedorPadre, AlCambiarPagina) {
    if (!ContenedorPadre) return;
    const Botones = ContenedorPadre.querySelectorAll(".BotonPagina[data-pagina]");
    Botones.forEach((Boton) => {
      Boton.addEventListener("click", () => {
        if (Boton.disabled) return;
        const NumPagina = parseInt(Boton.dataset.pagina, 10);
        if (!isNaN(NumPagina)) {
          AlCambiarPagina(NumPagina);
        }
      });
    });
  }
}
