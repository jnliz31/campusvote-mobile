<template>
    <div>
        <div class="welcome-section">
            <h1 class="welcome-title">
                Welcome, <em>{{ voter.name }}</em
                >!
            </h1>
            <p class="welcome-subtitle">
                "Cast your vote and make your voice heard."
            </p>
        </div>

        <!-- Election Status Alert -->
        <div
            v-if="electionStatus"
            :class="['alert', `alert-${electionStatus.type}`]"
            style="display: block; margin-bottom: 20px"
        >
            <strong>⏳ Election Status:</strong> {{ electionStatus.message }}
        </div>

        <div class="feature-grid">
            <div class="feature-card">
                <h3 class="feature-title">Vote Now</h3>
                <p class="feature-description">
                    Cast your vote in active elections and make your voice
                    heard.
                </p>
                <template v-if="activeElections.length > 0">
                    <router-link to="/voter/vote" class="btn btn-primary"
                        >Vote Now</router-link
                    >
                </template>
                <template v-else>
                    <button class="btn btn-secondary" disabled>
                        No Active Elections
                    </button>
                </template>
            </div>

            <div class="feature-card">
                <h3 class="feature-title">View Vote</h3>
                <p class="feature-description">
                    Check your voting history and verify your submissions.
                </p>
                <router-link to="/voter/votes" class="btn btn-success"
                    >View History</router-link
                >
            </div>

            <div class="feature-card">
                <h3 class="feature-title">View Results</h3>
                <p class="feature-description">
                    See real-time results and election outcomes.
                </p>
                <router-link to="/voter/results" class="btn btn-purple"
                    >View Results</router-link
                >
            </div>
        </div>

        <div class="announcements-section">
            <div class="announcements-header">
                <span class="announcements-icon">📢</span>
                <h2 class="announcements-title">Announcements</h2>
            </div>

            <template v-if="announcements.length > 0">
                <div
                    v-for="(announcement, index) in announcements"
                    :key="index"
                    class="announcement-item"
                >
                    <p class="announcement-text">{{ announcement.content }}</p>
                </div>
            </template>
            <template v-else>
                <p style="text-align: center; color: #666">
                    No announcements at this time.
                </p>
            </template>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { useAuthStore } from "../../stores/authStore.js";

export default {
    name: "VoterDashboard",
    setup() {
        const electionStore = useElectionStore();
        const authStore = useAuthStore();
        return { electionStore, authStore };
    },
    data() {
        return {
            electionStatus: null,
            hasVoted: false,
        };
    },
    computed: {
        voter() {
            return this.authStore.user || { name: "Student" };
        },
        announcements() {
            return this.electionStore.announcements;
        },
        activeElections() {
            return this.electionStore.activeElections || [];
        },
        loading() {
            return this.electionStore.isLoading;
        },
    },
    async mounted() {
        await this.loadDashboard();
    },
    methods: {
        async loadDashboard() {
            try {
                const data = await this.electionStore.loadDashboard();

                // Show status message for multiple active elections
                if (this.activeElections.length > 0) {
                    this.electionStatus = {
                        type: "info",
                        message: `${this.activeElections.length} active election(s) available`,
                    };
                } else {
                    this.electionStatus = {
                        type: "warning",
                        message: "No active elections at the moment",
                    };
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
                this.electionStatus = {
                    type: "error",
                    message:
                        "Failed to load dashboard. Please refresh the page.",
                };
            }
        },
    },
};
</script>

<style scoped>
.welcome-section {
    margin-bottom: 40px;
}

.welcome-title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
}

.welcome-title em {
    font-style: normal;
    color: #116b27;
}

.welcome-subtitle {
    font-size: 18px;
    color: #666;
    line-height: 1.6;
}

.alert {
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    border-left: 4px solid;
}

.alert-info {
    background: #d1ecf1;
    color: #0c5460;
    border-left-color: #17a2b8;
}

.alert-warning {
    background: #fff3cd;
    color: #856404;
    border-left-color: #ffc107;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    width: 100%;
}

.feature-card {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
}

.feature-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background-color: #0366d6;
    color: white;
}

.btn-primary:hover {
    background-color: #0256c1;
}

.btn-success {
    background-color: #22863a;
    color: white;
}

.btn-success:hover {
    background-color: #1a6b2e;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-purple {
    background-color: #8b5cf6;
    color: white;
}

.btn-purple:hover {
    background-color: #7c3aed;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 12px;
}

.elections-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 15px;
}

.election-item {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;
}

.election-item:hover {
    border-color: #0366d6;
    box-shadow: 0 2px 8px rgba(3, 102, 214, 0.1);
}

.election-item h4 {
    margin: 0 0 5px 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.election-item p {
    margin: 0;
    font-size: 12px;
    color: #666;
}

.announcements-section {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.announcements-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.announcements-icon {
    font-size: 24px;
}

.announcements-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.announcement-item {
    padding: 15px;
    border-left: 4px solid;
    margin-bottom: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.announcement-item:nth-child(1) {
    border-left-color: #0366d6;
}

.announcement-item:nth-child(2) {
    border-left-color: #d73a49;
}

.announcement-item:nth-child(3) {
    border-left-color: #22863a;
}

.announcement-item:nth-child(4) {
    border-left-color: #f9826c;
}

.announcement-text {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    margin: 0;
}
</style>
