<template>
    <div class="votes-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">Your Votes</h1>
                <p class="header-subtitle">
                    View all elections you have voted in
                </p>
            </div>
            <div class="header-action">
                <span class="vote-count"
                    >{{ votes.length }} Vote{{
                        votes.length !== 1 ? "s" : ""
                    }}</span
                >
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading your votes...</p>
        </div>

        <!-- Votes List -->
        <div v-else-if="votes.length > 0" class="votes-container">
            <div v-for="vote in votes" :key="vote.id" class="vote-card">
                <!-- Card Header -->
                <div class="vote-header">
                    <div class="header-left">
                        <h3 class="vote-election">{{ vote.election.title }}</h3>
                        <span class="vote-status">✓ Voted</span>
                    </div>
                    <div class="header-right">
                        <div class="vote-date">
                            {{ formatDate(vote.created_at) }}
                        </div>
                        <div class="vote-time">
                            {{ formatTime(vote.created_at) }}
                        </div>
                    </div>
                </div>

                <!-- Card Body - Positions and Candidates -->
                <div class="vote-body">
                    <div
                        v-for="position in vote.positions"
                        :key="position.id"
                        class="vote-item"
                    >
                        <div class="position-header">
                            <span class="position-icon">🏛️</span>
                            <span class="position-name">{{
                                position.name
                            }}</span>
                            <span class="candidate-count">{{
                                position.selected_candidates.length
                            }}</span>
                        </div>
                        <div class="selected-candidates">
                            <div
                                v-for="(
                                    candidate, index
                                ) in position.selected_candidates"
                                :key="index"
                                class="candidate-badge"
                            >
                                <span class="candidate-check">✓</span>
                                <span class="candidate-name">{{
                                    candidate
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="vote-footer">
                    <router-link
                        :to="`/voter/elections/${vote.election.id}/results`"
                        class="footer-link"
                    >
                        View Results →
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <h2>No Votes Cast Yet</h2>
            <p>
                You haven't participated in any elections yet. Cast your vote to
                get started.
            </p>
            <router-link to="/voter/vote" class="btn btn-primary">
                Cast Your Vote Now
            </router-link>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";

export default {
    name: "VoterVotes",
    setup() {
        const electionStore = useElectionStore();
        return { electionStore };
    },
    data() {
        return {
            votes: [],
            loading: false,
        };
    },
    computed: {
    },
    async mounted() {
        await this.loadVotes();
    },
    methods: {
        async loadVotes() {
            this.loading = true;
            try {
                this.votes = await this.electionStore.loadVotes();
            } catch (error) {
                console.error("Error loading votes:", error);
            } finally {
                this.loading = false;
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
        formatTime(date) {
            return new Date(date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        },
    },
};
</script>

<style scoped>
.votes-page {
    padding: 20px 0;
}

/* ==================== Page Header ==================== */
.page-header {
    background: linear-gradient(135deg, #116b27 0%, #22863a 100%);
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 40px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    box-shadow: 0 4px 20px rgba(17, 107, 39, 0.15);
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}

.header-subtitle {
    font-size: 15px;
    opacity: 0.95;
    margin: 0;
    font-weight: 400;
}

.header-action {
    text-align: right;
}

.vote-count {
    font-size: 18px;
    font-weight: 700;
    display: block;
    background: rgba(255, 255, 255, 0.15);
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.25);
}

/* ==================== Loading State ==================== */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #116b27;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-container p {
    color: #666;
    font-size: 16px;
    font-weight: 500;
}

/* ==================== Votes Container ==================== */
.votes-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

@media (max-width: 768px) {
    .votes-container {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
}

@media (max-width: 480px) {
    .votes-container {
        grid-template-columns: 1fr;
    }
}

/* ==================== Vote Card ==================== */
.vote-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
}

.vote-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
}

/* Card Header */
.vote-header {
    background: linear-gradient(135deg, #116b27 0%, #22863a 100%);
    color: white;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.header-left {
    flex: 1;
}

.header-right {
    text-align: right;
}

.vote-election {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
}

.vote-status {
    display: inline-block;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.vote-date {
    font-size: 13px;
    opacity: 0.95;
    font-weight: 500;
    margin-bottom: 4px;
}

.vote-time {
    font-size: 12px;
    opacity: 0.85;
}

/* Card Body */
.vote-body {
    padding: 24px;
    flex: 1;
}

.vote-item {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
}

.vote-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.position-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.position-icon {
    font-size: 18px;
    line-height: 1;
}

.position-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    flex: 1;
}

.candidate-count {
    background: #e8f5e9;
    color: #116b27;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid #c8e6c9;
}

.selected-candidates {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.candidate-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #e8f5e9;
    color: #116b27;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #c8e6c9;
    transition: all 0.2s ease;
}

.candidate-badge:hover {
    background: #d4edda;
    border-color: #116b27;
    box-shadow: 0 2px 8px rgba(17, 107, 39, 0.15);
}

.candidate-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    background: #116b27;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

.candidate-name {
    flex: 1;
}

/* Card Footer */
.vote-footer {
    padding: 16px 24px;
    background: #f9f9f9;
    border-top: 1px solid #f0f0f0;
}

.footer-link {
    color: #116b27;
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.footer-link:hover {
    color: #22863a;
    gap: 6px;
}

/* ==================== Empty State ==================== */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
    display: block;
    opacity: 0.8;
}

.empty-state h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 12px 0;
}

.empty-state p {
    font-size: 16px;
    color: #666;
    max-width: 450px;
    margin: 0 auto 32px;
    line-height: 1.6;
}

/* ==================== Buttons ==================== */
.btn {
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.btn-primary {
    background: linear-gradient(135deg, #116b27 0%, #22863a 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.3);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0f5821 0%, #1d6f31 100%);
    box-shadow: 0 6px 16px rgba(17, 107, 39, 0.4);
    transform: translateY(-2px);
}

/* ==================== Responsive Design ==================== */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 16px;
    }

    .page-title {
        font-size: 24px;
    }

    .header-action {
        text-align: left;
        width: 100%;
    }

    .vote-card {
        margin-bottom: 0;
    }

    .vote-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .vote-body {
        padding: 16px;
    }

    .empty-state {
        padding: 60px 20px;
    }

    .empty-icon {
        font-size: 60px;
    }

    .empty-state h2 {
        font-size: 20px;
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 16px;
    }

    .page-title {
        font-size: 20px;
    }

    .header-subtitle {
        font-size: 13px;
    }

    .votes-container {
        gap: 16px;
    }

    .vote-header {
        padding: 16px;
    }

    .vote-election {
        font-size: 16px;
    }

    .vote-body {
        padding: 12px;
    }

    .vote-item {
        margin-bottom: 16px;
        padding-bottom: 16px;
    }

    .position-header {
        flex-wrap: wrap;
        gap: 8px;
    }

    .position-name {
        font-size: 12px;
        flex-basis: 100%;
    }

    .candidate-badge {
        font-size: 13px;
        padding: 8px 12px;
    }

    .empty-state {
        padding: 40px 16px;
    }

    .empty-icon {
        font-size: 50px;
        margin-bottom: 16px;
    }

    .btn {
        width: 100%;
        padding: 12px 16px;
    }
}
</style>
