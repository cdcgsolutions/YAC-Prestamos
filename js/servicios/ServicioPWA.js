import { ServicioNotificaciones } from "./ServicioNotificaciones.js";

export class ServicioPWA {
  static EventoInstalacion = null;
  static Registrado = false;

  static Inicializar() {
    // 1. Registrar Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
          .then((Registro) => {
            console.log("Service Worker PWA registrado exitosamente:", Registro.scope);
            this.Registrado = true;
          })
          .catch((Error) => {
            console.warn("Fallo al registrar Service Worker PWA:", Error);
          });
      });
    }

    // 2. Escuchar evento beforeinstallprompt para habilitar instalación
    window.addEventListener("beforeinstallprompt", (Evento) => {
      Evento.preventDefault();
      this.EventoInstalacion = Evento;
      window.dispatchEvent(new CustomEvent("PWAInstalable", { detail: { Instalable: true } }));
    });

    window.addEventListener("appinstalled", () => {
      this.EventoInstalacion = null;
      ServicioNotificaciones.MostrarExito("¡Aplicación instalada exitosamente en tu dispositivo!", "PWA Instalada");
      window.dispatchEvent(new CustomEvent("PWAInstalable", { detail: { Instalable: false } }));
    });
  }

  static async InstalarAplicacion() {
    if (!this.EventoInstalacion) {
      ServicioNotificaciones.MostrarInfo("Para instalar en iOS abre el menú Compartir y presiona 'Agregar al inicio'. En PC usa el botón de instalar en la barra del navegador.", "Instalación PWA");
      return;
    }

    this.EventoInstalacion.prompt();
    const Eleccion = await this.EventoInstalacion.userChoice;
    if (Eleccion.outcome === "accepted") {
      this.EventoInstalacion = null;
    }
  }
}
