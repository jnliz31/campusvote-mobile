import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { voterAPI, adminAPI } from "../services/api.js";

export const useElectionStore = defineStore("election", () => {
    // State
    const currentElection = ref(null);
    const activeElections = ref([]);
    const elections = ref([]);
    const results = ref(null);
    const resultsAvailable = ref(true);
    const announcements = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const electionStatus = ref(null);
    const voteCount = ref(0);

    // Computed
    const hasActiveElection = computed(() => activeElections.value.length > 0);
    const electionIsActive = computed(
        () => electionStatus.value?.status === "active",
    );
    const electionHasEnded = computed(
        () => electionStatus.value?.status === "ended",
    );

    // Actions
    const setCurrentElection = (election) => {
        currentElection.value = election;
    };

    const setActiveElections = (elections) => {
        activeElections.value = elections || [];
    };

    const setElections = (data) => {
        elections.value = data;
    };

    const setResults = (data, available = true) => {
        results.value = data;
        resultsAvailable.value = available;
    };

    const setAnnouncements = (data) => {
        announcements.value = data;
    };

    const setError = (errorMsg) => {
        error.value = errorMsg;
    };

    const clearError = () => {
        error.value = null;
    };

    const setElectionStatus = (status) => {
        electionStatus.value = status;
    };

    const updateVoteCount = (count) => {
        voteCount.value = count;
    };

    // Voter Actions
    const loadVotePage = async (electionId = null) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await voterAPI.getVote(electionId);
            setCurrentElection(response.data.election);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load vote page";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadDashboard = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await voterAPI.getDashboard();
            setActiveElections(response.data.active_elections);
            setAnnouncements(response.data.announcements);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load dashboard";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadResults = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await voterAPI.getResults();
            setResults(
                response.data.results,
                response.data.results_available !== false,
            );
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load results";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const submitVote = async (votes, electionId = null) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await voterAPI.submitVote(votes, electionId);
            setCurrentElection(null); // Clear after submission
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to submit vote";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadVotes = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await voterAPI.getVotes();
            const votes = response.data.votes || [];
            return votes;
        } catch (err) {
            error.value = err.response?.data?.message || "Failed to load votes";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadElectionStatus = async () => {
        try {
            const response = await voterAPI.getElectionStatus();
            setElectionStatus(response.data);
            return response.data;
        } catch (err) {
            console.error("Failed to load election status:", err);
        }
    };

    const loadLiveResults = async () => {
        try {
            const response = await voterAPI.getElectionLive();
            if (response.data.vote_count !== undefined) {
                updateVoteCount(response.data.vote_count);
            }
            if (response.data.results) {
                setResults(response.data.results);
            }
            return response.data;
        } catch (err) {
            console.error("Failed to load live results:", err);
        }
    };

    // Admin Actions
    const loadAdminElections = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.getElections();
            setElections(response.data.elections);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load elections";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createElection = async (electionData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.createElection(electionData);
            if (response.data && response.data.election) {
                setCurrentElection(response.data.election);
                return response.data;
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.errors ||
                err.message ||
                "Failed to create election";
            error.value = errorMsg;
            console.error("Election creation error:", {
                status: err.response?.status,
                message: err.response?.data?.message,
                errors: err.response?.data?.errors,
                fullError: err,
            });
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadAdminElection = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.getElection(id);
            setCurrentElection(response.data.election);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load election";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateElection = async (id, electionData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.updateElection(id, electionData);
            setCurrentElection(response.data.election);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to update election";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const endElection = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.endElection(id);
            setElectionStatus({ status: "ended" });
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to end election";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteElection = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.deleteElection(id);
            // Remove from list
            elections.value = elections.value.filter((e) => e.id !== id);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to delete election";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadAdminResults = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.getResults();
            setResults(response.data.results);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load results";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const loadAdminAnnouncements = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.getAnnouncements();
            setAnnouncements(response.data.announcements);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load announcements";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createAnnouncement = async (data) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.createAnnouncement(data);
            announcements.value.unshift(response.data.announcement);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to create announcement";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateAnnouncement = async (id, data) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.updateAnnouncement(id, data);
            const index = announcements.value.findIndex((a) => a.id === id);
            if (index !== -1) {
                announcements.value[index] = response.data.announcement;
            }
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to update announcement";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteAnnouncement = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.deleteAnnouncement(id);
            announcements.value = announcements.value.filter(
                (a) => a.id !== id,
            );
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to delete announcement";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // Voter Management Actions
    const voters = ref([]);

    const setVoters = (data) => {
        voters.value = data;
    };

    const loadVoters = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.getVoters();
            setVoters(response.data.voters || []);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to load voters";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteVoter = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await adminAPI.deleteVoter(id);
            voters.value = voters.value.filter((v) => v.id !== id);
            return response.data;
        } catch (err) {
            error.value =
                err.response?.data?.message || "Failed to delete voter";
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const resetStore = () => {
        currentElection.value = null;
        activeElections.value = [];
        elections.value = [];
        results.value = null;
        announcements.value = [];
        isLoading.value = false;
        error.value = null;
        electionStatus.value = null;
        voteCount.value = 0;
    };

    return {
        // State
        currentElection,
        activeElections,
        elections,
        results,
        resultsAvailable,
        announcements,
        voters,
        isLoading,
        error,
        electionStatus,
        voteCount,

        // Computed
        hasActiveElection,
        electionIsActive,
        electionHasEnded,

        // Actions
        setCurrentElection,
        setActiveElections,
        setElections,
        setResults,
        setAnnouncements,
        setError,
        clearError,
        setElectionStatus,
        updateVoteCount,
        loadVotePage,
        loadDashboard,
        loadResults,
        loadVotes,
        submitVote,
        loadElectionStatus,
        loadLiveResults,
        loadAdminElections,
        createElection,
        loadAdminElection,
        updateElection,
        endElection,
        deleteElection,
        loadAdminResults,
        loadAdminAnnouncements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        loadVoters,
        deleteVoter,
        resetStore,
    };
});
