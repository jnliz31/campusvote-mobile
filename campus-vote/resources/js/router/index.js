import { createRouter, createWebHistory } from "vue-router";

// Auth pages
import VoterLogin from "../components/auth/VoterLogin.vue";
import VoterRegister from "../components/auth/VoterRegister.vue";
import AdminLogin from "../components/auth/AdminLogin.vue";

// Voter pages
import VoterDashboard from "../components/voter/VoterDashboard.vue";
import VoterVote from "../components/voter/VoterVote.vue";
import VoterVotes from "../components/voter/VoterVotes.vue";
import VoterResults from "../components/voter/VoterResults.vue";
import VoterProfile from "../components/voter/VoterProfile.vue";

// Admin pages
import AdminDashboard from "../components/admin/AdminDashboard.vue";
import AdminElections from "../components/admin/AdminElections.vue";
import AdminCreateElection from "../components/admin/AdminCreateElection.vue";
import AdminEditElection from "../components/admin/AdminEditElection.vue";
import AdminVoters from "../components/admin/AdminVoters.vue";
import AdminResults from "../components/admin/AdminResults.vue";
import AdminAnnouncements from "../components/admin/AdminAnnouncements.vue";

// Layouts
import DashboardLayout from "../components/layouts/DashboardLayout.vue";
import AuthLayout from "../components/layouts/AuthLayout.vue";

// Import Pinia auth store
import { useAuthStore } from "../stores/authStore.js";

const routes = [
    // Auth routes (no authentication required)
    {
        path: "/",
        component: AuthLayout,
        children: [
            {
                path: "",
                redirect: "/admin/login",
            },
            {
                path: "/voter/login",
                name: "voter-login",
                component: VoterLogin,
            },
            {
                path: "/voter/register",
                name: "voter-register",
                component: VoterRegister,
            },
            {
                path: "/admin/login",
                name: "admin-login",
                component: AdminLogin,
            },
        ],
    },

    // Voter protected routes
    {
        path: "/voter",
        component: DashboardLayout,
        meta: { requiresAuth: true, role: "voter" },
        children: [
            {
                path: "dashboard",
                name: "voter-dashboard",
                component: VoterDashboard,
            },
            {
                path: "vote",
                name: "voter-vote",
                component: VoterVote,
            },
            {
                path: "votes",
                name: "voter-votes",
                component: VoterVotes,
            },
            {
                path: "results",
                name: "voter-results",
                component: VoterResults,
            },
            {
                path: "elections/:id/results",
                name: "voter-election-results",
                component: VoterResults,
            },
            {
                path: "profile",
                name: "voter-profile",
                component: VoterProfile,
            },
        ],
    },

    // Admin protected routes
    {
        path: "/admin",
        component: DashboardLayout,
        meta: { requiresAuth: true, role: "admin" },
        children: [
            {
                path: "dashboard",
                name: "admin-dashboard",
                component: AdminDashboard,
            },
            {
                path: "elections",
                name: "admin-elections",
                component: AdminElections,
            },
            {
                path: "elections/create",
                name: "admin-create-election",
                component: AdminCreateElection,
            },
            {
                path: "elections/:id/edit",
                name: "admin-edit-election",
                component: AdminEditElection,
            },
            {
                path: "voters",
                name: "admin-voters",
                component: AdminVoters,
            },
            {
                path: "results",
                name: "admin-results",
                component: AdminResults,
            },
            {
                path: "announcements",
                name: "admin-announcements",
                component: AdminAnnouncements,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Authentication guard using Pinia store
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        // Check if already authenticated
        if (authStore.isAuthenticated) {
            // Verify role matches if required
            if (to.meta.role && to.meta.role !== authStore.role) {
                next(
                    `/${authStore.role}/dashboard` ||
                        `/${authStore.role}/login`,
                );
            } else {
                next();
            }
        } else {
            // Not authenticated, check server status
            const isAuthenticated = await authStore.checkAuthStatus();

            if (isAuthenticated) {
                // Verify role matches if required
                if (to.meta.role && to.meta.role !== authStore.role) {
                    next(
                        `/${authStore.role}/dashboard` ||
                            `/${authStore.role}/login`,
                    );
                } else {
                    next();
                }
            } else {
                // Redirect to appropriate login based on route
                const roleFromRoute = to.meta.role || "voter";
                next(`/${roleFromRoute}/login`);
            }
        }
    } else {
        // Route doesn't require auth, allow access
        next();
    }
});

// Restore authentication state on app initialization
router.beforeResolve(async (to, from, next) => {
    const authStore = useAuthStore();

    // Only check on first load (from is unrecognized)
    if (!from.name && !authStore.isAuthenticated) {
        await authStore.checkAuthStatus();
    }

    next();
});

export default router;
