<template>
    <div class="elections-management">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title-section">
                    <h1 class="page-title">Manage Elections</h1>
                    <p class="page-subtitle">
                        Create, edit, and manage all elections
                    </p>
                </div>
                <router-link
                    to="/admin/elections/create"
                    class="btn btn-primary btn-lg"
                >
                    <span class="btn-icon">+</span>
                    Create New Election
                </router-link>
            </div>
        </div>

        <!-- Stats Summary -->
        <div v-if="elections.length > 0" class="stats-summary">
            <div class="stat-item">
                <div class="stat-value">{{ elections.length }}</div>
                <div class="stat-label">Total Elections</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ activeCount }}</div>
                <div class="stat-label">Active Elections</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ totalPositions }}</div>
                <div class="stat-label">Total Positions</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ totalVotes }}</div>
                <div class="stat-label">Total Votes</div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading elections...</p>
        </div>

        <!-- Elections List -->
        <div v-else-if="elections.length > 0" class="elections-container">
            <div
                v-for="election in elections"
                :key="election.id"
                class="election-card"
            >
                <!-- Card Header -->
                <div class="card-header">
                    <div class="header-left">
                        <h3 class="election-title">{{ election.title }}</h3>
                        <span
                            :class="[
                                'status-badge',
                                `status-${election.status}`,
                            ]"
                        >
                            {{
                                election.status === "active"
                                    ? "● Active"
                                    : "● Ended"
                            }}
                        </span>
                    </div>
                    <div class="header-right">
                        <div class="election-date">
                            {{ formatDateTime(election.created_at) }}
                        </div>
                    </div>
                </div>

                <!-- Card Description -->
                <div v-if="election.description" class="card-description">
                    {{ election.description }}
                </div>

                <!-- Card Stats -->
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-icon">🏛️</span>
                        <div>
                            <div class="stat-number">
                                {{ election.positions_count }}
                            </div>
                            <div class="stat-text">Positions</div>
                        </div>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">🗳️</span>
                        <div>
                            <div class="stat-number">
                                {{ election.votes_count }}
                            </div>
                            <div class="stat-text">Votes Cast</div>
                        </div>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">📊</span>
                        <div>
                            <div class="stat-number">
                                {{
                                    election.votes_count > 0
                                        ? (
                                              (election.votes_count /
                                                  (election.positions_count ||
                                                      1)) *
                                              100
                                          ).toFixed(0)
                                        : 0
                                }}%
                            </div>
                            <div class="stat-text">Participation</div>
                        </div>
                    </div>
                </div>

                <!-- Card Actions -->
                <div class="card-actions">
                    <router-link
                        :to="`/admin/elections/${election.id}/edit`"
                        class="action-btn btn-edit"
                        title="Edit election details"
                    >
                        <span class="btn-icon">✎</span>
                        Edit
                    </router-link>
                    <button
                        v-if="election.status === 'active'"
                        @click="endElection(election.id)"
                        class="action-btn btn-end"
                        title="End this election"
                    >
                        <span class="btn-icon">⏹</span>
                        End
                    </button>
                    <button
                        @click="deleteElection(election.id)"
                        class="action-btn btn-delete"
                        title="Delete election"
                    >
                        <span class="btn-icon">🗑</span>
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No Elections Yet</h3>
            <p>
                Get started by creating your first election. You can add
                positions and candidates to allow voters to participate.
            </p>
            <router-link
                to="/admin/elections/create"
                class="btn btn-primary btn-lg"
            >
                <span class="btn-icon">+</span>
                Create First Election
            </router-link>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { useNotification } from "../../composables/useNotification.js";
import { useConfirmDialog } from "../../composables/useConfirmDialog.js";

export default {
    name: "AdminElections",
    setup() {
        const electionStore = useElectionStore();
        const {
            error: showError,
            success: showSuccess,
            warning: showWarning,
        } = useNotification();
        const { confirm: showConfirm, confirmDangerous: showConfirmDangerous } =
            useConfirmDialog();
        return {
            electionStore,
            showError,
            showSuccess,
            showWarning,
            showConfirm,
            showConfirmDangerous,
        };
    },
    computed: {
        elections() {
            return this.electionStore.elections || [];
        },
        loading() {
            return this.electionStore.isLoading;
        },
        activeCount() {
            return this.elections.filter((e) => e.status === "active").length;
        },
        totalPositions() {
            return this.elections.reduce(
                (sum, e) => sum + (e.positions_count || 0),
                0,
            );
        },
        totalVotes() {
            return this.elections.reduce(
                (sum, e) => sum + (e.votes_count || 0),
                0,
            );
        },
    },
    async mounted() {
        await this.loadElections();
    },
    methods: {
        async loadElections() {
            try {
                await this.electionStore.loadAdminElections();
            } catch (error) {
                console.error("Error loading elections:", error);
                this.showError("Failed to load elections");
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
        formatDateTime(date) {
            const d = new Date(date);
            return (
                d.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }) +
                " at " +
                d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );
        },
        async endElection(electionId) {
            const confirmed = await this.showConfirm(
                "Are you sure you want to end this election? Voters will no longer be able to vote.",
                {
                    title: "End Election",
                    confirmText: "End Election",
                    isDangerous: false,
                },
            );

            if (!confirmed) return;

            try {
                await this.electionStore.endElection(electionId);
                this.showSuccess("Election ended successfully!");
                await this.loadElections();
            } catch (error) {
                console.error("Error ending election:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to end election. Please try again.";
                this.showError(errorMessage);
            }
        },
        async deleteElection(electionId) {
            const election = this.elections.find((e) => e.id === electionId);

            // Check if election is active
            if (election && election.status === "active") {
                this.showWarning(
                    "Cannot delete an active election. Please end the election first.",
                );
                return;
            }

            // Build confirmation message with warning
            let confirmMessage =
                "Are you sure you want to permanently delete this election?";
            if (election && election.votes_count > 0) {
                confirmMessage += ` This election has ${election.votes_count} vote(s). `;
                confirmMessage +=
                    "All votes, candidates, and positions will be permanently removed.";
            }

            const confirmed = await this.showConfirmDangerous(confirmMessage, {
                title: "Delete Election",
                confirmText: "Delete",
            });

            if (!confirmed) return;

            try {
                await this.electionStore.deleteElection(electionId);
                // Show success message
                this.showSuccess("Election deleted successfully!");
                // Note: No need to reload - the store already removes it from elections array
            } catch (error) {
                console.error("Error deleting election:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to delete election";
                this.showError(errorMessage);
            }
        },
    },
};
</script>

<style scoped>
.elections-management {
    padding: 20px 0;
}

/* ==================== Header Section ==================== */
.page-header {
    background: #116b27;
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 40px;
    box-shadow: 0 4px 20px rgba(13, 71, 161, 0.1);
    color: white;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
}

.header-title-section h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}

.page-subtitle {
    font-size: 16px;
    opacity: 0.95;
    margin: 0;
    font-weight: 400;
}

/* ==================== Stats Summary ==================== */
.stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-item {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-left: 4px solid #0d47a1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.stat-value {
    font-size: 36px;
    font-weight: 700;
    color: #0d47a1;
    margin-bottom: 8px;
    display: block;
}

.stat-label {
    font-size: 13px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
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
    margin-bottom: 40px;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #0d47a1;
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

/* ==================== Elections Container ==================== */
.elections-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

@media (max-width: 768px) {
    .elections-container {
        grid-template-columns: 1fr;
    }
}

/* ==================== Election Card ==================== */
.election-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.election-card:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
}

/* Card Header */
.card-header {
    background: #116b27;
    color: white;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.header-left {
    flex: 1;
}

.election-title {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    word-break: break-word;
}

.status-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.25);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
}

.status-active {
    background: rgba(76, 175, 80, 0.8);
    border-color: rgba(76, 175, 80, 1);
}

.status-ended {
    background: rgba(158, 158, 158, 0.8);
    border-color: rgba(158, 158, 158, 1);
}

.election-date {
    font-size: 12px;
    opacity: 0.85;
    white-space: nowrap;
}

/* Card Description */
.card-description {
    padding: 16px 24px;
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    border-bottom: 1px solid #f0f0f0;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* Card Stats */
.card-stats {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    flex: 1;
}

.stat {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.stat:last-child {
    margin-bottom: 0;
}

.stat-icon {
    font-size: 24px;
    line-height: 1;
}

.stat-number {
    font-size: 20px;
    font-weight: 700;
    color: #0d47a1;
    display: block;
    line-height: 1;
}

.stat-text {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
}

/* Card Actions */
.card-actions {
    padding: 16px 24px;
    display: flex;
    gap: 10px;
}

.action-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;
}

.btn-edit {
    background: #1976d2;
    color: white;
}

.btn-edit:hover {
    background: #1565c0;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-end {
    background: #f57c00;
    color: white;
}

.btn-end:hover {
    background: #e65100;
    box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);
}

.btn-delete {
    background: #d32f2f;
    color: white;
}

.btn-delete:hover {
    background: #c62828;
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.btn-icon {
    font-size: 16px;
    font-weight: 700;
}

/* ==================== Buttons ==================== */
.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    position: relative;
    overflow: hidden;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #116b27;
    color: white;
    box-shadow: 0 4px 12px rgba(13, 71, 161, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-primary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(13, 71, 161, 0.4);
    transform: translateY(-2px);
}

.btn-lg {
    padding: 14px 32px;
    font-size: 15px;
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

.empty-state h3 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0 0 12px 0;
}

.empty-state p {
    font-size: 16px;
    color: #666;
    max-width: 500px;
    margin: 0 auto 32px;
    line-height: 1.6;
}

/* ==================== Responsive Design ==================== */
@media (max-width: 1024px) {
    .elections-container {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
}

@media (max-width: 600px) {
    .page-header {
        padding: 24px;
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
    }

    .page-header h1 {
        font-size: 24px;
    }

    .elections-container {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .stats-summary {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .stat-item {
        padding: 16px;
    }

    .stat-value {
        font-size: 28px;
    }

    .stat-label {
        font-size: 11px;
    }

    .card-actions {
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
    }
}
</style>
