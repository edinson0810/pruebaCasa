// frontend/src/router/router.js

class Router {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.routes = {};
        this.currentPath = null;
    }

    addRoute(path, pageFunction) {
        this.routes[path] = pageFunction;
    }

    async renderPage(path) {
        const pageFunction = this.routes[path];
        if (pageFunction) {
            this.rootElement.innerHTML = ''; // Limpiar el contenido actual

            try {
                // Ejecutar la función de la página, la cual se encargará de cargar el HTML y JS
                await pageFunction(this.rootElement);
                this.currentPath = path;
            } catch (error) {
                console.error(`Error al renderizar la página para la ruta ${path}:`, error);
                this.rootElement.innerHTML = '<p class="error-message">Error al cargar la página.</p>';
            }
        } else {
            console.warn(`Ruta no encontrada: ${path}`);
            this.rootElement.innerHTML = '<h2>404 - Página no encontrada</h2>';
        }
    }

    start() {
        // Escucha cambios en el hash de la URL
        window.addEventListener('hashchange', () => {
            this.handleLocation();
        });

        // Escucha el evento popstate (navegación con botones de atrás/adelante del navegador)
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        // Maneja la ubicación inicial al cargar la página
        this.handleLocation();
    }

    async handleLocation() {
        const path = window.location.hash.substring(1) || '/'; // Obtiene la ruta del hash
        await this.renderPage(path);
    }

    navigate(path) {
        window.location.hash = path; // Cambia el hash de la URL para navegar
    }

    
}

export { Router }; // Exporta la clase Router