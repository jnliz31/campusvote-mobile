<template>
    <div class="elections-management">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title-section">
                    <div class="header-icon-wrap">
                        <svg class="header-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="page-title">Manage Elections</h1>
                        <p class="page-subtitle">Create, manage, and monitor all campus elections</p>
                    </div>
                </div>
                <router-link to="/admin/elections/create" class="btn btn-create">
                    <svg class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Election
                </router-link>
            </div>
        </div>

        <!-- Stats Summary -->
        <div v-if="elections.length > 0" class="stats-summary">
            <div class="stat-card stat-total">
                <div class="stat-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">{{ elections.length }}</div>
                    <div class="stat-label">Total Elections</div>
                </div>
            </div>
            <div class="stat-card stat-active">
                <div class="stat-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">{{ activeCount }}</div>
                    <div class="stat-label">Active Now</div>
                </div>
            </div>
            <div class="stat-card stat-positions">
                <div class="stat-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6.75h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">{{ totalPositions }}</div>
                    <div class="stat-label">Total Positions</div>
                </div>
            </div>
            <div class="stat-card stat-votes">
                <div class="stat-icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                </div>
                <div class="stat-info">
                    <div class="stat-value">{{ totalVotes }}</div>
                    <div class="stat-label">Votes Cast</div>
                </div>
            </div>
        </div>

        <!-- Filter & Search Bar -->
        <div v-if="elections.length > 0" class="filter-bar">
            <div class="filter-search">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search elections..."
                    class="search-input"
                />
            </div>
            <div class="filter-group">
                <button
                    v-for="f in statusFilters"
                    :key="f.value"
                    :class="['filter-btn', activeFilter === f.value && 'filter-btn-active']"
                    @click="activeFilter = f.value"
                >
                    {{ f.label }}
                    <span class="filter-count">{{ countByStatus(f.value) }}</span>
                </button>
            </div>
            <div class="filter-org">
                <select v-model="orgFilter" class="org-select">
                    <option value="">All Organizations</option>
                    <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                        {{ org.name }} ({{ org.code }})
                    </option>
                </select>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading elections...</p>
        </div>

        <!-- Elections Grid -->
        <div v-else-if="filteredElections.length > 0" class="elections-grid">
            <div
                v-for="election in filteredElections"
                :key="election.id"
                :class="['election-card', `card-status-${election.status}`]"
            >
                <!-- Organization Banner -->
                <div
                    v-if="election.organization"
                    class="org-banner"
                    :style="getOrgBannerStyle(election.organization)"
                >
                    <svg class="org-banner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                    <span class="org-banner-name">{{ election.organization.name }}</span>
                    <span class="org-banner-code">{{ election.organization.code }}</span>
                </div>
                <div v-else class="org-banner org-banner-none">
                    <svg class="org-banner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span class="org-banner-name">All Organizations</span>
                </div>

                <!-- Card Header -->
                <div class="card-header">
                    <div class="header-left">
                        <h3 class="election-title">{{ election.title }}</h3>
                        <p v-if="election.description" class="election-desc">{{ election.description }}</p>
                    </div>
                    <span :class="['status-pill', `status-${election.status}`]">
                        <span class="status-dot"></span>
                        {{ election.status === 'active' ? 'Active' : 'Ended' }}
                    </span>
                </div>

                <!-- Stats Row -->
                <div class="card-stats-row">
                    <div class="card-stat">
                        <svg class="cs-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        <span class="cs-value">{{ election.positions_count }}</span>
                        <span class="cs-label">Positions</span>
                    </div>
                    <div class="cs-divider"></div>
                    <div class="card-stat">
                        <svg class="cs-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                        </svg>
                        <span class="cs-value">{{ election.votes_count }}</span>
                        <span class="cs-label">Votes</span>
                    </div>
                    <div class="cs-divider"></div>
                    <div class="card-stat">
                        <svg class="cs-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                        <span class="cs-value cs-date">{{ formatDate(election.created_at) }}</span>
                        <span class="cs-label">Created</span>
                    </div>
                </div>

                <!-- Progress Bar (only for active) -->
                <div v-if="election.status === 'active'" class="participation-bar">
                    <div class="pb-label">
                        <span>Participation</span>
                        <span class="pb-pct">{{ getParticipation(election) }}%</span>
                    </div>
                    <div class="pb-track">
                        <div class="pb-fill" :style="{ width: getParticipation(election) + '%' }"></div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="card-actions">
                    <router-link
                        :to="`/admin/elections/${election.id}/edit`"
                        class="action-btn btn-edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit
                    </router-link>
                    <button
                        v-if="election.status === 'active'"
                        @click="endElection(election.id)"
                        class="action-btn btn-end"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                        </svg>
                        End
                    </button>
                    <button
                        @click="deleteElection(election.id)"
                        class="action-btn btn-delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- No results from filter -->
        <div v-else-if="!loading && elections.length > 0" class="no-results">
            <div class="no-results-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                </svg>
            </div>
            <h3>No elections match your filter</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button @click="resetFilters" class="btn-reset">Clear Filters</button>
        </div>

        <!-- Empty State (no elections at all) -->
        <div v-else-if="!loading" class="empty-state">
            <div class="empty-illustration">
                <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                </div>
                <div class="empty-rings">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                </div>
            </div>
            <h3>No Elections Yet</h3>
            <p>Start by creating your first election. Add positions and candidates to let voters participate.</p>
            <router-link to="/admin/elections/create" class="btn btn-create btn-create-lg">
                <svg class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create First Election
            </router-link>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { useNotification } from "../../composables/useNotification.js";
import { useConfirmDialog } from "../../composables/useConfirmDialog.js";

const ORG_COLORS = [
    '#1976d2', '#7b1fa2', '#c62828', '#00796b', '#e65100',
    '#0288d1', '#558b2f', '#ad1457', '#6a1b9a', '#2e7d32',
];

export default {
    name: "AdminElections",
    setup() {
        const electionStore = useElectionStore();
        const { error: showError, success: showSuccess, warning: showWarning } = useNotification();
        const { confirm: showConfirm, confirmDangerous: showConfirmDangerous } = useConfirmDialog();
        return { electionStore, showError, showSuccess, showWarning, showConfirm, showConfirmDangerous };
    },
    data() {
        return {
            searchQuery: '',
            activeFilter: 'all',
            orgFilter: '',
            statusFilters: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'ended', label: 'Ended' },
            ],
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
            return this.elections.filter((e) => e.status === 'active').length;
        },
        totalPositions() {
            return this.elections.reduce((sum, e) => sum + (e.positions_count || 0), 0);
        },
        totalVotes() {
            return this.elections.reduce((sum, e) => sum + (e.votes_count || 0), 0);
        },
        availableOrgs() {
            const orgs = {};
            this.elections.forEach((e) => {
                if (e.organization) {
                    orgs[e.organization.id] = e.organization;
                }
            });
            return Object.values(orgs).sort((a, b) => a.name.localeCompare(b.name));
        },
        filteredElections() {
            let list = this.elections;
            if (this.activeFilter !== 'all') {
                list = list.filter((e) => e.status === this.activeFilter);
            }
            if (this.orgFilter) {
                list = list.filter((e) => e.organization_id == this.orgFilter);
            }
            if (this.searchQuery.trim()) {
                const q = this.searchQuery.trim().toLowerCase();
                list = list.filter(
                    (e) =>
                        e.title.toLowerCase().includes(q) ||
                        (e.description || '').toLowerCase().includes(q) ||
                        (e.organization?.name || '').toLowerCase().includes(q) ||
                        (e.organization?.code || '').toLowerCase().includes(q),
                );
            }
            return list;
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
                console.error('Error loading elections:', error);
                this.showError('Failed to load elections');
            }
        },
        countByStatus(status) {
            if (status === 'all') return this.elections.length;
            return this.elections.filter((e) => e.status === status).length;
        },
        getParticipation(election) {
            if (!election.votes_count || !election.positions_count) return 0;
            return Math.min(100, ((election.votes_count / (election.positions_count || 1)) * 100).toFixed(0));
        },
        getOrgBannerStyle(org) {
            if (!org) return {};
            const idx = org.id % ORG_COLORS.length;
            return { backgroundColor: ORG_COLORS[idx] };
        },
        resetFilters() {
            this.searchQuery = '';
            this.activeFilter = 'all';
            this.orgFilter = '';
        },
        formatDate(date) {
            if (!date) return '—';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
        async endElection(electionId) {
            const confirmed = await this.showConfirm(
                'Are you sure you want to end this election? Voters will no longer be able to vote.',
                { title: 'End Election', confirmText: 'End Election', isDangerous: false },
            );
            if (!confirmed) return;
            try {
                await this.electionStore.endElection(electionId);
                this.showSuccess('Election ended successfully!');
                await this.loadElections();
            } catch (error) {
                this.showError(error.response?.data?.message || error.message || 'Failed to end election.');
            }
        },
        async deleteElection(electionId) {
            const election = this.elections.find((e) => e.id === electionId);
            if (election?.status === 'active') {
                this.showWarning('Cannot delete an active election. Please end it first.');
                return;
            }
            let msg = 'Are you sure you want to permanently delete this election?';
            if (election?.votes_count > 0) {
                msg += ` This election has ${election.votes_count} vote(s). All related data will be removed.`;
            }
            const confirmed = await this.showConfirmDangerous(msg, { title: 'Delete Election', confirmText: 'Delete' });
            if (!confirmed) return;
            try {
                await this.electionStore.deleteElection(electionId);
                this.showSuccess('Election deleted successfully!');
            } catch (error) {
                this.showError(error.response?.data?.message || error.message || 'Failed to delete election.');
            }
        },
    },
};
</script>

<style scoped>
/* =========================================================
   Base
   ========================================================= */
.elections-management {
    padding: 0;
}

/* =========================================================
   Page Header
   ========================================================= */
.page-header {
    background: linear-gradient(135deg, #116b27 0%, #1e8c38 60%, #2ea44e 100%);
    border-radius: 18px;
    padding: 36px 40px;
    margin-bottom: 28px;
    box-shadow: 0 8px 32px rgba(17, 107, 39, 0.22);
    position: relative;
    overflow: hidden;
}

.page-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
}

.page-header::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -20px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    position: relative;
    z-index: 1;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 18px;
}

.header-icon-wrap {
    width: 56px; height: 56px;
    background: rgba(255,255,255,0.18);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    flex-shrink: 0;
    color: white;
}

.header-icon-svg {
    width: 32px;
    height: 32px;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 4px;
    color: #fff;
    letter-spacing: -0.5px;
}

.page-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.75);
    margin: 0;
}

.btn-create {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.4);
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.22s ease;
    white-space: nowrap;
    backdrop-filter: blur(4px);
}

.btn-create:hover {
    background: rgba(255,255,255,0.28);
    border-color: rgba(255,255,255,0.7);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.btn-icon-svg {
    width: 20px;
    height: 20px;
}

/* =========================================================
   Stats Summary
   ========================================================= */
.stats-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

@media (max-width: 900px) {
    .stats-summary { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
    border-bottom: 3px solid transparent;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.stat-total { border-bottom-color: #1976d2; }
.stat-active { border-bottom-color: #2e7d32; }
.stat-positions { border-bottom-color: #7b1fa2; }
.stat-votes { border-bottom-color: #e65100; }

.stat-icon-wrap {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: #666;
}

.stat-value {
    font-size: 30px;
    font-weight: 800;
    color: #1a2a3a;
    line-height: 1;
}

.stat-label {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-top: 2px;
}

/* =========================================================
   Filter Bar
   ========================================================= */
.filter-bar {
    background: #fff;
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    flex-wrap: wrap;
}

.filter-search {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.search-icon {
    position: absolute;
    left: 12px; top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #999;
}

.search-input {
    width: 100%;
    padding: 10px 14px 10px 38px;
    border: 1.5px solid #e0e0e0;
    border-radius: 10px;
    font-size: 14px;
    color: #333;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
}

.search-input:focus {
    border-color: #116b27;
    box-shadow: 0 0 0 3px rgba(17,107,39,0.1);
}

.filter-group {
    display: flex;
    gap: 8px;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 24px;
    background: #f8f9fa;
    color: #666;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    border-color: #116b27;
    color: #116b27;
}

.filter-btn-active {
    background: #116b27;
    border-color: #116b27;
    color: #fff;
}

.filter-count {
    background: rgba(255,255,255,0.25);
    border-radius: 12px;
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 700;
}

.filter-btn-active .filter-count {
    background: rgba(255,255,255,0.3);
}

.org-select {
    padding: 9px 14px;
    border: 1.5px solid #e0e0e0;
    border-radius: 10px;
    font-size: 13px;
    color: #444;
    background: #f8f9fa;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    min-width: 180px;
}

.org-select:focus {
    border-color: #116b27;
    box-shadow: 0 0 0 3px rgba(17,107,39,0.1);
}

/* =========================================================
   Elections Grid
   ========================================================= */
.elections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));
    gap: 22px;
    margin-bottom: 40px;
}

@media (max-width: 768px) {
    .elections-grid { grid-template-columns: 1fr; }
}

/* =========================================================
   Election Card
   ========================================================= */
.election-card {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 14px rgba(0,0,0,0.07);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s, box-shadow 0.25s;
    border: 1px solid #f0f0f0;
}

.election-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(0,0,0,0.12);
}

.card-status-active { border-top: 3px solid #2e7d32; }
.card-status-ended  { border-top: 3px solid #9e9e9e; }

/* Org Banner */
.org-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    background: #1976d2;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
}

.org-banner-none {
    background: #607d8b;
}

.org-banner-icon { width: 16px; height: 16px; }

.org-banner-name {
    flex: 1;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.org-banner-code {
    background: rgba(255,255,255,0.22);
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

/* Card Header */
.card-header {
    padding: 18px 20px 12px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.header-left { flex: 1; }

.election-title {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 800;
    color: #1a2a3a;
    line-height: 1.3;
    word-break: break-word;
}

.election-desc {
    margin: 0;
    font-size: 13px;
    color: #777;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}

.status-active {
    background: #e8f5e9;
    color: #2e7d32;
}

.status-ended {
    background: #f5f5f5;
    color: #757575;
}

.status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    display: inline-block;
    background: currentColor;
}

.status-active .status-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

/* Card Stats Row */
.card-stats-row {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;
    gap: 0;
}

.card-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.cs-icon { width: 20px; height: 20px; color: #888; margin-bottom: 2px; }

.cs-value {
    font-size: 18px;
    font-weight: 800;
    color: #1a2a3a;
    line-height: 1.1;
}

.cs-date {
    font-size: 12px;
    font-weight: 700;
    color: #555;
}

.cs-label {
    font-size: 10px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: 700;
}

.cs-divider {
    width: 1px;
    height: 36px;
    background: #eee;
    margin: 0 4px;
}

/* Participation Bar */
.participation-bar {
    padding: 10px 20px;
    border-bottom: 1px solid #f3f3f3;
}

.pb-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #888;
    font-weight: 600;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.pb-pct {
    font-weight: 800;
    color: #2e7d32;
}

.pb-track {
    height: 6px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
}

.pb-fill {
    height: 100%;
    background: linear-gradient(90deg, #2e7d32, #4caf50);
    border-radius: 10px;
    transition: width 0.6s ease;
}

/* Card Actions */
.card-actions {
    padding: 14px 16px;
    display: flex;
    gap: 8px;
    margin-top: auto;
}

.action-btn {
    flex: 1;
    padding: 9px 10px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.action-btn svg {
    width: 14px;
    height: 14px;
}

.btn-edit {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #bbdefb;
}
.btn-edit:hover { background: #1565c0; color: #fff; box-shadow: 0 4px 12px rgba(21,101,192,0.25); }

.btn-end {
    background: #fff3e0;
    color: #e65100;
    border: 1px solid #ffe0b2;
}
.btn-end:hover { background: #e65100; color: #fff; box-shadow: 0 4px 12px rgba(230,81,0,0.25); }

.btn-delete {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}
.btn-delete:hover { background: #c62828; color: #fff; box-shadow: 0 4px 12px rgba(198,40,40,0.25); }

/* =========================================================
   Loading State
   ========================================================= */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 20px;
    background: #fff;
    border-radius: 18px;
}

.spinner {
    width: 44px; height: 44px;
    border: 4px solid #e8f5e9;
    border-top-color: #116b27;
    border-radius: 50%;
    animation: spin 0.85s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* =========================================================
   No Results
   ========================================================= */
.no-results {
    text-align: center;
    padding: 60px 20px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.no-results-icon { color: #999; margin-bottom: 16px; }
.no-results-icon svg { width: 56px; height: 56px; margin: 0 auto; display: block; }
.no-results h3 { font-size: 22px; font-weight: 700; color: #333; margin: 0 0 8px; }
.no-results p { color: #888; font-size: 14px; margin: 0 0 20px; }

.btn-reset {
    background: #116b27;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}
.btn-reset:hover { background: #0d5720; }

/* =========================================================
   Empty State
   ========================================================= */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.empty-illustration {
    position: relative;
    display: inline-block;
    margin-bottom: 28px;
}

.empty-icon {
    width: 72px; height: 72px;
    color: #116b27;
    position: relative;
    z-index: 2;
    margin: 0 auto;
}

.empty-rings {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
}

.ring {
    border-radius: 50%;
    border: 2px solid rgba(17,107,39,0.12);
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
}

.ring-1 { width: 90px; height: 90px; }
.ring-2 { width: 120px; height: 120px; animation: ring-pulse 2s ease-in-out infinite; }
.ring-3 { width: 150px; height: 150px; animation: ring-pulse 2s ease-in-out 0.5s infinite; }

@keyframes ring-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.1; }
}

.empty-state h3 { font-size: 26px; font-weight: 800; color: #222; margin: 0 0 10px; }
.empty-state p { font-size: 15px; color: #777; max-width: 440px; margin: 0 auto 28px; line-height: 1.6; }

.btn-create-lg {
    font-size: 15px;
    padding: 14px 32px;
}

/* =========================================================
   Responsive
   ========================================================= */
@media (max-width: 600px) {
    .page-header { padding: 24px 20px; }
    .header-content { flex-direction: column; align-items: stretch; }
    .filter-bar { flex-direction: column; align-items: stretch; }
    .filter-search { min-width: auto; }
    .org-select { width: 100%; }
    .stats-summary { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .stat-card { padding: 14px; }
    .stat-value { font-size: 24px; }
}
</style>
