import { ServicioPWA } from "./servicios/ServicioPWA.js";
import { LayoutPrincipal } from "./componentes/LayoutPrincipal.js";
import { Enrutador } from "./Enrutador.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar tema guardado
  LayoutPrincipal.InicializarTema();

  // 2. Inicializar soporte PWA
  ServicioPWA.Inicializar();

  // 3. Inicializar enrutador de la aplicación
  Enrutador.Inicializar();
});
