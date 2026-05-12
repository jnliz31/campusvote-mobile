import "./bootstrap";
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import { initializeWebSocket } from "./services/websocket.js";

// Import root component
import App from "./components/App.vue";

// Initialize CSRF token
function initializeCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (csrfMetaTag && csrfMetaTag.content) {
        const token = csrfMetaTag.content;
        localStorage.setItem("csrf_token", token);
        // Also set it in window for easy access
        window.csrfToken = token;
    }
}

// Initialize CSRF token before creating app
initializeCsrfToken();

// Initialize Pinia store
const pinia = createPinia();

// Initialize WebSocket connection
initializeWebSocket();

// Create and mount the Vue app
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount("#app");
