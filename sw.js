const NombreCache = "yac-prestamos-v5";
const RecursosCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/styles.css",
  "./iconos/icon.svg",
  "./iconos/icon.png",
  "./js/app.js",
  "./js/Enrutador.js",
  "./js/servicios/ConfiguracionFirebase.js",
  "./js/servicios/ServicioFirebase.js",
  "./js/servicios/ServicioSesion.js",
  "./js/servicios/ServicioNotificaciones.js",
  "./js/servicios/ServicioPWA.js",
  "./js/componentes/LayoutPrincipal.js",
  "./js/componentes/ComponenteModal.js",
  "./js/componentes/ComponentePaginacion.js",
  "./js/componentes/PaginaLogin.js",
  "./js/componentes/PaginaInicio.js",
  "./js/componentes/PaginaUsuarios.js",
  "./js/componentes/ModalUsuario.js",
  "./js/componentes/PaginaClientes.js",
  "./js/componentes/ModalCliente.js",
  "./js/componentes/PaginaPrestamos.js",
  "./js/componentes/ModalPrestamo.js",
  "./js/componentes/ModalPago.js",
  "./js/componentes/ModalHistorialPagos.js"
];

self.addEventListener("install", (Evento) => {
  self.skipWaiting();
  Evento.waitUntil(
    caches.open(NombreCache).then((Cache) => {
      return Cache.addAll(RecursosCache).catch((Error) => {
        console.warn("Error cacheando recursos:", Error);
      });
    })
  );
});

self.addEventListener("activate", (Evento) => {
  Evento.waitUntil(
    caches.keys().then((ListaClaves) => {
      return Promise.all(
        ListaClaves.map((Clave) => {
          if (Clave !== NombreCache) {
            return caches.delete(Clave);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (Evento) => {
  if (Evento.request.method !== "GET") return;

  const Url = new URL(Evento.request.url);
  if (Url.origin.includes("firestore.googleapis.com") || Url.origin.includes("firebase") || Url.origin.includes("gstatic.com")) {
    return;
  }

  // Network first para desarrollo para que siempre obtenga los últimos cambios de código
  Evento.respondWith(
    fetch(Evento.request)
      .then((RespuestaRed) => {
        if (RespuestaRed && RespuestaRed.status === 200 && RespuestaRed.type === "basic") {
          const ClonRespuesta = RespuestaRed.clone();
          caches.open(NombreCache).then((Cache) => {
            Cache.put(Evento.request, ClonRespuesta);
          });
        }
        return RespuestaRed;
      })
      .catch(() => {
        return caches.match(Evento.request).then((RespuestaCache) => {
          return RespuestaCache || caches.match("./index.html");
        });
      })
  );
});