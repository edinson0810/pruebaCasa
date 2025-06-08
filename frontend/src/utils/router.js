// frontend/src/utils/router.js
export class Router {
    constructor(rootElement) {
        this.routes = {};
        this.rootElement = rootElement;
        // Para que la instancia del router esté disponible globalmente para los enlaces en HTML
        window.router = this;
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path, addToHistory = true) {
        if (addToHistory) {
            history.pushState(null, null, path);
        }
        this.loadRoute(path);
    }

    loadRoute(path) {
        const handler = this.routes[path] || this.routes['/']; // Fallback a la ruta raíz
        if (handler) {
            // Limpiar el contenido anterior
            this.rootElement.innerHTML = '';
            // Ejecutar el handler (que renderizará la página)
            handler(this.rootElement);
        } else {
            this.rootElement.innerHTML = '<h1>404 - Página no encontrada</h1>';
        }
    }

    start() {
        // Escuchar cambios en la URL (ej. botones de atrás/adelante del navegador)
        window.addEventListener('popstate', () => this.loadRoute(window.location.pathname));
        // Cargar la ruta inicial
        this.loadRoute(window.location.pathname);
    }
}