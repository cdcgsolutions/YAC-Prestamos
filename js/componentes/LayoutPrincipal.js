import { ServicioSesion } from "../servicios/ServicioSesion.js";
import { ServicioPWA } from "../servicios/ServicioPWA.js";
import { Enrutador } from "../Enrutador.js";

export class LayoutPrincipal {
  static UsuarioActual = null;
  static RutaActiva = "inicio";
  static PwaDisponible = Boolean(ServicioPWA.EventoInstalacion);

  static InicializarTema() {
    const TemaGuardado = localStorage.getItem("tema_yac") || "light";
    document.documentElement.setAttribute("data-theme", TemaGuardado);
  }

  static AlternarTema() {
    const TemaActual = document.documentElement.getAttribute("data-theme") || "light";
    const NuevoTema = TemaActual === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", NuevoTema);
    localStorage.setItem("tema_yac", NuevoTema);
    
    // Actualizar icono del botón de tema
    const IconoTema = document.getElementById("IconoTemaBoton");
    const TextoTema = document.getElementById("TextoTemaBoton");
    if (IconoTema && TextoTema) {
      if (NuevoTema === "dark") {
        IconoTema.className = "fa-solid fa-sun";
        TextoTema.textContent = "Modo Claro";
      } else {
        IconoTema.className = "fa-solid fa-moon";
        TextoTema.textContent = "Modo Oscuro";
      }
    }
  }

  static async Renderizar(ContenidoHTML, RutaActual = "inicio") {
    this.RutaActiva = RutaActual;
    this.InicializarTema();

    if (!this.UsuarioActual) {
      this.UsuarioActual = await ServicioSesion.ObtenerUsuarioActual();
    }

    const Nombre = this.UsuarioActual?.NombreUsuario || "Usuario";
    const Correo = this.UsuarioActual?.CorreoElectronico || "usuario@yac.com";
    const Inicial = Nombre.trim().charAt(0).toUpperCase() || "U";
    const TemaActual = document.documentElement.getAttribute("data-theme") || "light";
    const EsMovil = window.innerWidth <= 992;
    const SidebarPlegado = !EsMovil && (localStorage.getItem("sidebar_plegado") === "true");

    const ContenedorApp = document.getElementById("App");
    ContenedorApp.innerHTML = `
      <div class="LayoutDashboard ${SidebarPlegado ? "SidebarPlegado" : ""}" id="LayoutDashboardPrincipal">
        <!-- OVERLAY PARA MOVIL -->
        <div class="SidebarOverlay" id="SidebarOverlay"></div>

        <!-- SIDEBAR -->
        <aside class="Sidebar" id="SidebarPrincipal">
          <div class="SidebarHeader">
            <div class="AvatarUsuario">${Inicial}</div>
            <div class="NombreUsuario" title="${Nombre}">${Nombre}</div>
            <div class="CorreoUsuario" title="${Correo}">${Correo}</div>
          </div>

          <nav class="SidebarNav">
            <a class="EnlaceNav ${RutaActual === "inicio" ? "Activo" : ""}" href="#inicio">
              <i class="fa-solid fa-chart-pie"></i>
              <span>Inicio</span>
            </a>
            <a class="EnlaceNav ${RutaActual === "usuarios" ? "Activo" : ""}" href="#usuarios">
              <i class="fa-solid fa-users-gear"></i>
              <span>Gestión de Usuarios</span>
            </a>
            <a class="EnlaceNav ${RutaActual === "clientes" ? "Activo" : ""}" href="#clientes">
              <i class="fa-solid fa-people-roof"></i>
              <span>Clientes</span>
            </a>
            <a class="EnlaceNav ${RutaActual === "prestamos" ? "Activo" : ""}" href="#prestamos">
              <i class="fa-solid fa-hand-holding-dollar"></i>
              <span>Préstamos</span>
            </a>
          </nav>

          <div class="SidebarFooter">
            <!-- BOTÓN INSTALAR PWA -->
            <button class="BotonPWA" id="BotonInstalarPWA" style="${this.PwaDisponible ? "display: flex;" : "display: none;"}">
              <i class="fa-solid fa-download"></i>
              <span>Instalar App</span>
            </button>

            <!-- CONMUTADOR DE TEMA -->
            <button class="BotonTema" id="BotonAlternarTema">
              <i id="IconoTemaBoton" class="${TemaActual === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"}"></i>
              <span id="TextoTemaBoton">${TemaActual === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>

            <!-- CERRAR SESIÓN -->
            <button class="BotonCerrarSesion" id="BotonCerrarSesionGlobal">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Cerrar Sesión</span>
            </button>

            <div class="Copyright">
              © ${new Date().getFullYear()} CDCG Solutions
            </div>
          </div>
        </aside>

        <!-- CONTENIDO PRINCIPAL -->
        <div class="ContenedorPrincipal" id="ContenedorPrincipal">
          <header class="HeaderTop">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <button class="BotonToggleSidebar" id="BotonToggleSidebar" aria-label="Abrir o Cerrar Menú" title="Menú de Navegación">
                <i class="fa-solid fa-bars" id="IconoToggleSidebar"></i>
              </button>
              <div class="TituloSeccionHeader">
                ${this.ObtenerTituloSeccion(RutaActual)}
              </div>
            </div>
          </header>

          <main class="ContenidoCuerpo" id="CuerpoPrincipal">
            ${ContenidoHTML}
          </main>
        </div>
      </div>
    `;

    this.AdjuntarEventosLayout();
  }

  static ObtenerTituloSeccion(Ruta) {
    switch (Ruta) {
      case "inicio": return "Panel de Control";
      case "usuarios": return "Gestión de Usuarios";
      case "clientes": return "Gestión de Clientes";
      case "prestamos": return "Gestión de Préstamos";
      default: return "Sistema YAC";
    }
  }

  static AdjuntarEventosLayout() {
    const Layout = document.getElementById("LayoutDashboardPrincipal");
    const BotonToggle = document.getElementById("BotonToggleSidebar");
    const Sidebar = document.getElementById("SidebarPrincipal");
    const Overlay = document.getElementById("SidebarOverlay");
    const BotonTema = document.getElementById("BotonAlternarTema");
    const BotonLogout = document.getElementById("BotonCerrarSesionGlobal");
    const BotonPWA = document.getElementById("BotonInstalarPWA");

    const AlternarSidebar = () => {
      const EnMovil = window.innerWidth <= 992;
      if (EnMovil) {
        const EstaAbierto = Sidebar.classList.contains("Abierto");
        if (EstaAbierto) {
          Sidebar.classList.remove("Abierto");
          Overlay.classList.remove("Abierto");
        } else {
          Sidebar.classList.add("Abierto");
          Overlay.classList.add("Abierto");
        }
      } else {
        Layout.classList.toggle("SidebarPlegado");
        const EstaPlegado = Layout.classList.contains("SidebarPlegado");
        localStorage.setItem("sidebar_plegado", EstaPlegado ? "true" : "false");
      }
    };

    if (BotonToggle) BotonToggle.addEventListener("click", AlternarSidebar);
    
    if (Overlay) {
      Overlay.addEventListener("click", () => {
        Sidebar.classList.remove("Abierto");
        Overlay.classList.remove("Abierto");
      });
    }

    // Cerrar sidebar al hacer clic en enlaces en versión móvil
    Sidebar.querySelectorAll(".EnlaceNav").forEach((Enlace) => {
      Enlace.addEventListener("click", () => {
        if (window.innerWidth <= 992) {
          Sidebar.classList.remove("Abierto");
          Overlay.classList.remove("Abierto");
        }
      });
    });

    if (BotonTema) {
      BotonTema.addEventListener("click", () => this.AlternarTema());
    }

    if (BotonLogout) {
      BotonLogout.addEventListener("click", () => {
        ServicioSesion.CerrarSesion();
        this.UsuarioActual = null;
        Enrutador.NavegarA("login");
      });
    }

    if (BotonPWA) {
      BotonPWA.addEventListener("click", () => {
        ServicioPWA.InstalarAplicacion();
      });
    }

    // Escuchar cambios de disponibilidad PWA
    window.addEventListener("PWAInstalable", (e) => {
      this.PwaDisponible = e.detail.Instalable;
      const BotonPwaEl = document.getElementById("BotonInstalarPWA");
      if (BotonPwaEl) {
        BotonPwaEl.style.display = this.PwaDisponible ? "flex" : "none";
      }
    });
  }
}