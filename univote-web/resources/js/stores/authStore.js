import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "../services/api.js";

export const useAuthStore = defineStore("auth", () => {
    // State
    const user = ref(null);
    const token = ref(null);
    const role = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Computed
    const isAuthenticated = computed(() => !!user.value && !!token.value);
    const isVoter = computed(() => role.value === "voter");
    const isAdmin = computed(() => role.value === "admin");
    const hasVotedInElection = computed(() => {
        return (electionId) =>
            user.value?.voted_elections?.includes(electionId);
    });

    // Actions
    const setUser = (userData) => {
        user.value = userData;
    };

    const setToken = (authToken) => {
        token.value = authToken;
    };

    const setRole = (userRole) => {
        role.value = userRole;
    };

    const setError = (errorMsg) => {
        error.value = errorMsg;
    };

    const clearError = () => {
        error.value = null;
    };

    const voterLogin = async (email, password) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await authAPI.voterLogin(email, password);
            const { voter, auth_token } = response.data;

            setUser(voter);
            setToken(auth_token);
            setRole("voter");

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || "Login failed";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const adminLogin = async (email, password) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await authAPI.adminLogin(email, password);
            const { admin, auth_token } = response.data;

            setUser(admin);
            setToken(auth_token);
            setRole("admin");

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || "Login failed";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const voterRegister = async (data) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await authAPI.voterRegister(data);
            const { voter, auth_token } = response.data;

            setUser(voter);
            setToken(auth_token);
            setRole("voter");

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || "Registration failed";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const checkAuthStatus = async () => {
        isLoading.value = true;
        try {
            // Try admin first (admin has priority)
            const adminCheck = await authAPI.adminCheck().catch(() => null);
            if (adminCheck?.data?.authenticated) {
                setUser(adminCheck.data.admin);
                setToken(adminCheck.data.auth_token);
                setRole("admin");
                return true;
            }

            // Try voter
            const voterCheck = await authAPI.voterCheck().catch(() => null);
            if (voterCheck?.data?.authenticated) {
                setUser(voterCheck.data.voter);
                setToken(voterCheck.data.auth_token);
                setRole("voter");
                return true;
            }

            // Not authenticated
            logout();
            return false;
        } catch (err) {
            console.error("Auth check error:", err);
            logout();
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        try {
            if (isVoter.value) {
                await authAPI.voterLogout();
            } else if (isAdmin.value) {
                await authAPI.adminLogout();
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            user.value = null;
            token.value = null;
            role.value = null;
            error.value = null;
        }
    };

    const updateUserData = (userData) => {
        user.value = { ...user.value, ...userData };
    };

    const markElectionAsVoted = (electionId) => {
        if (!user.value) return;
        if (!user.value.voted_elections) {
            user.value.voted_elections = [];
        }
        if (!user.value.voted_elections.includes(electionId)) {
            user.value.voted_elections.push(electionId);
        }
    };

    return {
        // State
        user,
        token,
        role,
        isLoading,
        error,

        // Computed
        isAuthenticated,
        isVoter,
        isAdmin,
        hasVotedInElection,

        // Actions
        setUser,
        setToken,
        setRole,
        setError,
        clearError,
        voterLogin,
        adminLogin,
        voterRegister,
        checkAuthStatus,
        logout,
        updateUserData,
        markElectionAsVoted,
    };
});
