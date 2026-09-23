<template>
    <div class="results-page">
        <!-- Page Header -->
        <header class="page-header">
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
                    <h1 class="page-title">Finished Election Results</h1>
                    <p class="page-subtitle">
                        Official tallies and candidate outcomes for concluded elections
                    </p>
                </div>
            </div>

            <!-- Organization Filter Toolbar -->
            <div class="results-filter-toolbar">
                <div class="filter-item">
                    <label for="orgResultsFilter" class="filter-label">Organization:</label>
                    <select
                        id="orgResultsFilter"
                        v-model="selectedOrgFilter"
                        class="filter-select"
                        @change="onFilterChange"
                    >
                        <option value="all">All Organizations</option>
                        <option
                            v-for="org in organizations"
                            :key="org.id"
                            :value="org.id"
                        >
                            {{ org.name }} ({{ org.code }})
                        </option>
                        <option value="general">University-wide / General</option>
                    </select>
                </div>
            </div>
        </header>

        <!-- Finished Elections Results List -->
        <div v-if="filteredResults.length > 0" class="results-container">
            <article
                v-for="election in filteredResults"
                :key="election.id"
                class="election-section"
            >
                <div class="election-header">
                    <div class="election-header-main">
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
                        <div class="election-title-group">
                            <h2 class="election-title">{{ election.title }}</h2>
                            <div class="election-meta-row">
                                <!-- Organization Badge -->
                                <span v-if="election.organization" class="org-badge">
                                    {{ election.organization.name }} ({{ election.organization.code }})
                                </span>
                                <span v-else class="org-badge org-badge-general">
                                    University-wide
                                </span>

                                <!-- Timestamps -->
                                <span class="time-meta">
                                    <strong>Created:</strong> {{ formatDateTime(election.created_at_formatted || election.created_at) }}
                                </span>
                                <span class="time-meta">
                                    <strong>Ended:</strong> {{ formatDateTime(election.end_date_formatted || election.end_date) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span :class="['election-status', `status-${(election.status || 'ended').toLowerCase()}`]">
                        {{ election.status || 'Ended' }}
                    </span>
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
                                v-for="(candidate, index) in position.candidates"
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
                                            <span class="candidate-name">{{ candidate.name }}</span>
                                            <span
                                                v-if="isWinner(election, candidate, index)"
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
                                    <span class="vote-count">
                                        {{ candidate.vote_count }} {{ candidate.vote_count === 1 ? 'vote' : 'votes' }}
                                    </span>
                                </div>
                                <div class="progress-bar">
                                    <div
                                        class="progress-fill"
                                        :style="{
                                            width: (candidate.percentage || 0) + '%',
                                        }"
                                    >
                                        <span
                                            v-if="candidate.percentage > 10"
                                            class="percentage"
                                        >
                                            {{ Math.round(candidate.percentage) }}%
                                        </span>
                                    </div>
                                    <span
                                        v-if="candidate.percentage <= 10"
                                        class="percentage-outside"
                                    >
                                        {{ Math.round(candidate.percentage) }}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>

        <!-- Empty State -->
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
            <h2 class="empty-title">No Finished Elections Found</h2>
            <p class="empty-message">
                Only completed and concluded elections appear in this section. Active, draft, or upcoming elections will be displayed here once their voting period finishes.
            </p>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { adminAPI } from "../../services/api.js";

export default {
    name: "AdminResults",
    data() {
        return {
            selectedOrgFilter: "all",
            organizationOptions: [],
        };
    },
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
        organizations() {
            return this.organizationOptions;
        },
        filteredResults() {
            if (this.selectedOrgFilter === "all") {
                return this.results;
            }
            if (this.selectedOrgFilter === "general") {
                return this.results.filter(
                    (e) => e.organization_id === null || e.organization_id === undefined,
                );
            }
            return this.results.filter(
                (e) => Number(e.organization_id) === Number(this.selectedOrgFilter),
            );
        },
    },
    async mounted() {
        await Promise.all([this.loadResults(), this.loadOrganizations()]);
    },
    methods: {
        async loadResults() {
            try {
                await this.electionStore.loadAdminResults();
            } catch (error) {
                console.error("Error loading results:", error);
            }
        },
        async loadOrganizations() {
            try {
                const response = await adminAPI.getOrganizations();
                this.organizationOptions = response.data.organizations || [];
            } catch (error) {
                console.error("Error loading organizations:", error);
            }
        },
        async onFilterChange() {
            // Optional: can also query backend with organization_id param
            // Our computed property already filters instantly and cleanly
        },
        formatDateTime(dateStr) {
            if (!dateStr) return "—";
            // If already formatted as "Month Day, Year — Time" by backend, return it directly
            if (typeof dateStr === "string" && dateStr.includes("—")) {
                return dateStr;
            }
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;

            const datePart = date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
            const timePart = date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            return `${datePart} — ${timePart}`;
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
            // 1. Election has ended or closed
            // 2. Candidate is at index 0 (top votes)
            // 3. Candidate has at least 1 vote
            const isEnded = election.status === "ended" || election.status === "closed";
            return isEnded && index === 0 && candidate.vote_count > 0;
        },
    },
};
</script>

<style scoped>
.results-page {
    padding: 30px 40px;
    max-width: 1400px;
    margin: 0 auto;
    color: #17231d;
}

/* Page Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 34px;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 18px;
}

.header-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #116b27, #22863a);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(17, 107, 39, 0.25);
    flex-shrink: 0;
}

.header-icon svg {
    width: 28px;
    height: 28px;
}

.page-title {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #17231d;
}

.page-subtitle {
    font-size: 14px;
    color: #68756d;
    margin: 0;
}

/* Filter Toolbar */
.results-filter-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-label {
    font-size: 13px;
    font-weight: 700;
    color: #43544b;
    white-space: nowrap;
}

.filter-select {
    padding: 8px 14px;
    border: 1px solid #cdd8cf;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #17231d;
    background: #ffffff;
    outline: none;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.filter-select:focus {
    border-color: #146c3a;
    box-shadow: 0 0 0 2px rgba(20, 108, 58, 0.15);
}

/* Results Container */
.results-container {
    display: grid;
    gap: 36px;
}

/* Election Section */
.election-section {
    background: white;
    padding: 32px;
    border-radius: 14px;
    border: 1px solid #dce5de;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.election-section:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.election-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #edf1ed;
}

.election-header-main {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex: 1;
}

.election-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #116b27, #22863a);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 10px rgba(17, 107, 39, 0.2);
    flex-shrink: 0;
}

.election-icon svg {
    width: 22px;
    height: 22px;
}

.election-title-group {
    flex: 1;
}

.election-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #17231d;
}

.election-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 13px;
    color: #4b5563;
}

.org-badge {
    display: inline-block;
    padding: 3px 10px;
    background: #e8eeea;
    color: #146c3a;
    border-radius: 999px;
    font-weight: 750;
    font-size: 12px;
}

.org-badge-general {
    background: #f3f4f6;
    color: #4b5563;
}

.time-meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #59665e;
}

.time-meta strong {
    color: #294033;
}

.election-status {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #eef0ee;
    color: #59665e;
}

.election-status.status-ended,
.election-status.status-closed {
    background: #e3f3e7;
    color: #146c3a;
}

/* Positions Grid */
.positions-grid {
    display: grid;
    gap: 28px;
}

.position-section {
    background: #f9fbf9;
    padding: 24px;
    border-radius: 10px;
    border: 1px solid #edf1ed;
}

.position-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.position-icon {
    width: 26px;
    height: 26px;
    color: #146c3a;
}

.position-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #17231d;
}

/* Candidates Results */
.candidates-results {
    display: grid;
    gap: 16px;
}

.candidate-result {
    background: white;
    padding: 18px 20px;
    border-radius: 10px;
    border: 1px solid #dce5de;
    transition: all 0.2s ease;
}

.candidate-result.winner {
    border-color: #146c3a;
    background: linear-gradient(135deg, #f2faf4, #ffffff);
    box-shadow: 0 3px 10px rgba(20, 108, 58, 0.12);
}

.candidate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.candidate-info {
    display: flex;
    align-items: center;
    gap: 14px;
}

.candidate-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #146c3a, #22863a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: 700;
}

.candidate-name {
    font-size: 16px;
    font-weight: 700;
    color: #17231d;
    display: block;
    margin-bottom: 3px;
}

.winner-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: #146c3a;
    color: white;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.crown-icon {
    width: 14px;
    height: 14px;
}

.vote-count {
    font-size: 14px;
    font-weight: 700;
    color: #43544b;
    padding: 6px 14px;
    background: #f1f5f2;
    border-radius: 20px;
}

/* Progress Bar */
.progress-bar {
    height: 26px;
    background-color: #edf1ed;
    border-radius: 13px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #146c3a, #22863a);
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    transition: width 0.4s ease;
    min-width: 0;
}

.candidate-result.winner .progress-fill {
    background: linear-gradient(90deg, #0d5620, #146c3a);
}

.percentage {
    font-size: 13px;
    font-weight: 750;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.percentage-outside {
    font-size: 13px;
    font-weight: 750;
    color: #294033;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: white;
    border: 1px solid #dce5de;
    border-radius: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.empty-icon-wrapper {
    width: 90px;
    height: 90px;
    margin: 0 auto 24px;
    background: #f8faf8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #edf1ed;
}

.empty-icon {
    width: 44px;
    height: 44px;
    color: #9ca3af;
}

.empty-title {
    font-size: 26px;
    font-weight: 700;
    color: #17231d;
    margin: 0 0 12px 0;
}

.empty-message {
    font-size: 15px;
    color: #68756d;
    line-height: 1.6;
    margin: 0 auto;
    max-width: 540px;
}

@media (max-width: 768px) {
    .results-page {
        padding: 20px;
    }
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
    .results-filter-toolbar {
        width: 100%;
    }
    .filter-item {
        width: 100%;
        justify-content: space-between;
    }
    .filter-select {
        flex: 1;
    }
    .election-header {
        flex-direction: column;
    }
    .election-meta-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }
}
</style>
