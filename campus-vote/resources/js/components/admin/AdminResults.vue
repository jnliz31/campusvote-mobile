<template>
    <div class="results-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-icon">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <div>
                    <h1 class="page-title">Election Results</h1>
                    <p class="page-subtitle">
                        View and manage election results
                    </p>
                </div>
            </div>
        </div>

        <div v-if="results.length > 0" class="results-container">
            <div
                v-for="election in results"
                :key="election.id"
                class="election-section"
            >
                <div class="election-header">
                    <div class="election-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            />
                        </svg>
                    </div>
                    <h2 class="election-title">{{ election.title }}</h2>
                    <span class="election-status">{{ election.status }}</span>
                </div>

                <div class="positions-grid">
                    <div
                        v-for="position in election.positions"
                        :key="position.id"
                        class="position-section"
                    >
                        <div class="position-header">
                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                class="position-icon"
                            >
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fill-rule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <h3 class="position-name">{{ position.name }}</h3>
                        </div>

                        <div class="candidates-results">
                            <div
                                v-for="(
                                    candidate, index
                                ) in position.candidates"
                                :key="candidate.id"
                                class="candidate-result"
                                :class="{
                                    winner: isWinner(
                                        election,
                                        candidate,
                                        index,
                                    ),
                                }"
                            >
                                <div class="candidate-header">
                                    <div class="candidate-info">
                                        <div class="candidate-avatar">
                                            {{ getInitials(candidate.name) }}
                                        </div>
                                        <div>
                                            <span class="candidate-name">{{
                                                candidate.name
                                            }}</span>
                                            <span
                                                v-if="
                                                    isWinner(
                                                        election,
                                                        candidate,
                                                        index,
                                                    )
                                                "
                                                class="winner-badge"
                                            >
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    class="crown-icon"
                                                >
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                    />
                                                </svg>
                                                Winner
                                            </span>
                                        </div>
                                    </div>
                                    <span class="vote-count"
                                        >{{ candidate.vote_count }} votes</span
                                    >
                                </div>
                                <div class="progress-bar">
                                    <div
                                        class="progress-fill"
                                        :style="{
                                            width:
                                                (candidate.percentage || 0) +
                                                '%',
                                        }"
                                    >
                                        <span
                                            v-if="candidate.percentage > 10"
                                            class="percentage"
                                            >{{
                                                Math.round(
                                                    candidate.percentage,
                                                )
                                            }}%</span
                                        >
                                    </div>
                                    <span
                                        v-if="candidate.percentage <= 10"
                                        class="percentage-outside"
                                        >{{
                                            Math.round(candidate.percentage)
                                        }}%</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="empty-state">
            <div class="empty-icon-wrapper">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="empty-icon"
                >
                    <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            </div>
            <h2 class="empty-title">No Results Yet</h2>
            <p class="empty-message">
                No election results are available at this time.
            </p>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";

export default {
    name: "AdminResults",
    setup() {
        const electionStore = useElectionStore();
        return { electionStore };
    },
    computed: {
        results() {
            return this.electionStore.results || [];
        },
        loading() {
            return this.electionStore.isLoading;
        },
    },
    async mounted() {
        await this.loadResults();
    },
    methods: {
        async loadResults() {
            try {
                await this.electionStore.loadAdminResults();
            } catch (error) {
                console.error("Error loading results:", error);
            }
        },
        getInitials(name) {
            if (!name) return "?";
            const parts = name.trim().split(" ");
            if (parts.length === 1) {
                return parts[0].charAt(0).toUpperCase();
            }
            return (
                parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
            ).toUpperCase();
        },
        isWinner(election, candidate, index) {
            // Only show winner if:
            // 1. Election is ended
            // 2. This is the top candidate (index 0)
            // 3. The candidate has at least 1 vote (not 0 votes)
            return (
                election.status === "ended" &&
                index === 0 &&
                candidate.vote_count > 0
            );
        },
    },
};
</script>

<style scoped>
.results-page {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
}

/* Page Header */
.page-header {
    margin-bottom: 40px;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #116b27, #22863a);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.3);
}

.header-icon svg {
    width: 32px;
    height: 32px;
}

.page-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1a1a1a;
}

.page-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
}

/* Results Container */
.results-container {
    display: grid;
    gap: 40px;
}

/* Election Section */
.election-section {
    background: white;
    padding: 36px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.election-section:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.election-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.election-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #116b27, #22863a);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.2);
}

.election-icon svg {
    width: 24px;
    height: 24px;
}

.election-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
    flex: 1;
}

.election-status {
    padding: 8px 16px;
    background: #e8f5e9;
    color: #116b27;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Positions Grid */
.positions-grid {
    display: grid;
    gap: 32px;
}

.position-section {
    background: #f8f9fa;
    padding: 28px;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.position-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.position-icon {
    width: 32px;
    height: 32px;
    color: #116b27;
}

.position-name {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
}

/* Candidates Results */
.candidates-results {
    display: grid;
    gap: 20px;
}

.candidate-result {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.candidate-result.winner {
    border-color: #116b27;
    background: linear-gradient(135deg, #f0fff4, #ffffff);
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.15);
}

.candidate-result.winner:hover {
    box-shadow: 0 8px 20px rgba(17, 107, 39, 0.25);
}

.candidate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.candidate-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.candidate-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #116b27, #22863a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.3);
}

.candidate-name {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
    margin-bottom: 4px;
}

.winner-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #116b27, #22863a);
    color: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.3);
}

.crown-icon {
    width: 16px;
    height: 16px;
}

.vote-count {
    font-size: 15px;
    font-weight: 600;
    color: #666;
    padding: 8px 16px;
    background: #f8f9fa;
    border-radius: 20px;
}

/* Progress Bar */
.progress-bar {
    height: 32px;
    background-color: #f0f0f0;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #116b27, #22863a);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 12px;
    transition: width 0.5s ease;
    min-width: 0;
    box-shadow: 0 4px 8px rgba(17, 107, 39, 0.3);
}

.candidate-result.winner .progress-fill {
    background: linear-gradient(90deg, #0d5620, #1a6b2e);
}

.percentage {
    font-size: 14px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.percentage-outside {
    font-size: 14px;
    font-weight: 700;
    color: #333;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 100px 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.empty-icon-wrapper {
    width: 120px;
    height: 120px;
    margin: 0 auto 32px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon {
    width: 56px;
    height: 56px;
    color: #999;
}

.empty-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 16px 0;
}

.empty-message {
    font-size: 18px;
    color: #666;
    line-height: 1.6;
    margin: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}
</style>
