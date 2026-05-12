<template>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <router-link
                    :to="
                        userRole === 'voter'
                            ? '/voter/dashboard'
                            : '/admin/dashboard'
                    "
                    class="sidebar-logo"
                >
                    CampusVote
                </router-link>
            </div>

            <nav class="sidebar-nav">
                <!-- Voter Sidebar -->
                <template v-if="userRole === 'voter'">
                    <router-link
                        to="/voter/dashboard"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/voter/dashboard' ? 'active' : ''
                        "
                    >
                        Home
                    </router-link>
                    <router-link
                        to="/voter/vote"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/voter/vote' ? 'active' : ''
                        "
                    >
                        Vote Now
                    </router-link>
                    <router-link
                        to="/voter/votes"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/voter/votes' ? 'active' : ''
                        "
                    >
                        View Votes
                    </router-link>
                    <router-link
                        to="/voter/results"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/voter/results' ? 'active' : ''
                        "
                    >
                        View Results
                    </router-link>
                    <router-link
                        to="/voter/profile"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/voter/profile' ? 'active' : ''
                        "
                    >
                        Profile
                    </router-link>
                </template>

                <!-- Admin Sidebar -->
                <template v-else-if="userRole === 'admin'">
                    <router-link
                        to="/admin/dashboard"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/admin/dashboard' ? 'active' : ''
                        "
                    >
                        Home
                    </router-link>
                    <router-link
                        to="/admin/elections"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path.includes('/admin/elections')
                                ? 'active'
                                : ''
                        "
                    >
                        Manage Election
                    </router-link>
                    <router-link
                        to="/admin/elections/create"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/admin/elections/create'
                                ? 'active'
                                : ''
                        "
                    >
                        Create Election
                    </router-link>
                    <router-link
                        to="/admin/voters"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/admin/voters' ? 'active' : ''
                        "
                    >
                        Voters
                    </router-link>
                    <router-link
                        to="/admin/results"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/admin/results' ? 'active' : ''
                        "
                    >
                        Results
                    </router-link>
                    <router-link
                        to="/admin/announcements"
                        class="nav-item"
                        active-class="active"
                        :exact-active-class="
                            $route.path === '/admin/announcements'
                                ? 'active'
                                : ''
                        "
                    >
                        Announcements
                    </router-link>
                </template>
            </nav>

            <div class="sidebar-footer">
                <button @click="logout" class="btn-logout">
                    {{ userRole === "voter" ? "Log out" : "Logout" }}
                </button>
                <div class="copyright">
                    © 2025 CampusVote. All rights reserved.
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <div class="top-bar-title">{{ pageTitle }}</div>
                <div class="top-bar-right">
                    <input
                        v-if="userRole === 'voter'"
                        type="search"
                        placeholder="Search"
                        class="search-box"
                    />
                    <span v-else>CampusVote Dashboard</span>
                </div>
            </div>

            <div class="content-area">
                <!-- Alert messages -->
                <div v-if="message" :class="['alert', `alert-${message.type}`]">
                    {{ message.text }}
                </div>

                <router-view :key="$route.fullPath" />
            </div>
        </main>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";

export default {
    name: "DashboardLayout",
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            pageTitle: "Dashboard",
            message: null,
        };
    },
    computed: {
        userRole() {
            return this.authStore.role || "voter";
        },
    },
    watch: {
        $route() {
            this.updatePageTitle();
        },
    },
    mounted() {
        this.updatePageTitle();
    },
    methods: {
        updatePageTitle() {
            const titles = {
                "/voter/dashboard": "Welcome",
                "/voter/vote": "Vote now",
                "/voter/votes": "View Votes",
                "/voter/results": "View Results",
                "/voter/profile": "Profile",
                "/admin/dashboard": "Dashboard",
                "/admin/elections": "Manage Elections",
                "/admin/elections/create": "Create Election",
                "/admin/voters": "Voters",
                "/admin/results": "Results",
                "/admin/announcements": "Announcements",
            };
            this.pageTitle = titles[this.$route.path] || "Dashboard";
        },
        async logout() {
            try {
                await this.authStore.logout();
                this.$router.push("/voter/login");
            } catch (error) {
                console.error("Logout error:", error);
                // Force logout anyway
                await this.authStore.logout();
                this.$router.push("/voter/login");
            }
        },
    },
};
</script>

<style scoped>
.dashboard-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
}

.sidebar {
    width: 260px;
    background-color: #116b27;
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
}

.sidebar::-webkit-scrollbar {
    width: 6px;
}

.sidebar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.sidebar-header {
    padding: 30px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
    font-size: 24px;
    font-weight: 600;
    color: white;
    text-decoration: none;
}

.sidebar-nav {
    flex: 1;
    padding: 20px 0;
}

.nav-item {
    display: block;
    padding: 20px 20px;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
    font-size: 16px;
}

.nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
    background-color: #22863a;
    border-left: 4px solid white;
}

.sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-logout {
    width: 100%;
    padding: 12px;
    background-color: white;
    color: #1e5128;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-logout:hover {
    background-color: #f0f0f0;
}

.copyright {
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 15px;
}

.main-content {
    margin-left: 260px;
    width: calc(100% - 260px);
    min-height: 100vh;
    background-color: #f5f5f5;
}

.top-bar {
    background-color: #116b27;
    color: white;
    padding: 15px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-bar-title {
    font-size: 18px;
    font-weight: 500;
}

.search-box {
    background: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #ddd;
    font-size: 14px;
    width: 250px;
}

.content-area {
    padding: 40px;
    width: 100%;
    max-width: 100%;
}

.alert {
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    border-left: 4px solid;
}

.alert-success {
    background: #d4edda;
    color: #155724;
    border-left-color: #28a745;
}

.alert-error {
    background: #f8d7da;
    color: #721c24;
    border-left-color: #dc3545;
}

.alert-info {
    background: #d1ecf1;
    color: #0c5460;
    border-left-color: #17a2b8;
}
</style>
