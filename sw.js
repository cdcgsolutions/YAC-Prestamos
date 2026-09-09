const NombreCache = "yac-prestamos-v1";
const RecursosCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/styles.css",
  "./iconos/icon.svg",
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
  Evento.waitUntil(
    caches.open(NombreCache).then((Cache) => {
      return Cache.addAll(RecursosCache).catch((Error) => {
        console.warn("Algunos recursos estáticos no pudieron almacenarse en caché preliminar:", Error);
      });
    })
  );
  self.skipWaiting();
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
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (Evento) => {
  if (Evento.request.method !== "GET") return;
  
  // No almacenar peticiones a firestore en el service worker (firestore tiene su propio offline)
  const Url = new URL(Evento.request.url);
  if (Url.origin.includes("firestore.googleapis.com") || Url.origin.includes("firebase")) {
    return;
  }

  Evento.respondWith(
    caches.match(Evento.request).then((RespuestaEnCache) => {
      if (RespuestaEnCache) {
        return RespuestaEnCache;
      }
      return fetch(Evento.request).then((RespuestaRed) => {
        if (!RespuestaRed || RespuestaRed.status !== 200 || RespuestaRed.type !== "basic") {
          return RespuestaRed;
        }
        const ClonRespuesta = RespuestaRed.clone();
        caches.open(NombreCache).then((Cache) => {
          Cache.put(Evento.request, ClonRespuesta);
        });
        return RespuestaRed;
      }).catch(() => {
        return caches.match("./index.html");
      });
    })
  );
});
