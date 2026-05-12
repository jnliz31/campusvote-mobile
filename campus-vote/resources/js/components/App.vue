<template>
    <div id="app">
        <NotificationCenter />
        <ConfirmDialog />
        <router-view />
    </div>
</template>

<script>
import { useAuthStore } from "../stores/authStore.js";
import NotificationCenter from "./NotificationCenter.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

export default {
    name: "App",
    components: {
        NotificationCenter,
        ConfirmDialog,
    },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    async mounted() {
        // Sync auth state with server on app initialization
        await this.authStore.checkAuthStatus();
    },
};
</script>

<style scoped>
#app {
    width: 100%;
    height: 100%;
}
</style>
