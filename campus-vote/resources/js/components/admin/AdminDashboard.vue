<template>
    <section class="admin-dashboard">
        <header class="dashboard-heading">
            <div>
                <p class="eyebrow">Election operations</p>
                <h1>Control center</h1>
                <p class="heading-copy">Monitor participation, keep elections moving, and act on the work that needs attention.</p>
            </div>
            <div class="heading-actions">
                <button class="refresh-button" type="button" :disabled="loading" @click="loadDashboard">{{ loading ? "Refreshing..." : "Refresh data" }}</button>
                <router-link to="/admin/elections/create" class="create-button">+ Create election</router-link>
            </div>
        </header>

        <section class="metrics-grid" aria-label="Election metrics">
            <article class="metric-card metric-green"><p>Total elections</p><strong>{{ stats.total_elections }}</strong><span>{{ activeElections.length }} currently active</span></article>
            <article class="metric-card metric-blue"><p>Registered voters</p><strong>{{ stats.total_voters }}</strong><span>{{ participationRate }}% participation</span></article>
            <article class="metric-card metric-gold"><p>Votes recorded</p><strong>{{ stats.total_votes }}</strong><span>{{ votesPerElection }} average per election</span></article>
            <article class="metric-card metric-ink"><p>Election health</p><strong>{{ activeElections.length ? "Live" : "Ready" }}</strong><span>{{ activeElections.length ? "Monitoring active polls" : "No election in progress" }}</span></article>
        </section>

        <section class="dashboard-grid">
            <article class="panel live-panel">
                <div class="panel-heading"><div><p class="panel-kicker">Live oversight</p><h2>Election activity</h2></div><router-link to="/admin/elections" class="panel-link">Manage elections</router-link></div>
                <div v-if="loading" class="panel-loading">Loading election records...</div>
                <div v-else-if="activeElections.length" class="election-list">
                    <article v-for="election in activeElections" :key="election.id" class="election-row">
                        <div class="election-status" aria-hidden="true"></div>
                        <div class="election-details"><h3>{{ election.title }}</h3><p>{{ election.positions_count || 0 }} positions · {{ election.votes_count || 0 }} votes recorded</p></div>
                        <router-link :to="`/admin/elections/${election.id}/edit`" class="row-action">Open</router-link>
                    </article>
                </div>
                <div v-else class="empty-operations"><p>No active election is running.</p><router-link to="/admin/elections/create">Create an election</router-link></div>
            </article>

            <article class="panel participation-panel">
                <div class="panel-heading"><div><p class="panel-kicker">Participation</p><h2>Engagement snapshot</h2></div><span class="percentage">{{ participationRate }}%</span></div>
                <div class="progress-track" aria-hidden="true"><div class="progress-value" :style="{ width: `${participationRate}%` }"></div></div>
                <dl class="snapshot-list"><div><dt>Eligible voters</dt><dd>{{ stats.total_voters }}</dd></div><div><dt>Votes cast</dt><dd>{{ stats.total_votes }}</dd></div><div><dt>Completed elections</dt><dd>{{ completedElections }}</dd></div></dl>
            </article>

            <article class="panel action-panel">
                <div class="panel-heading"><div><p class="panel-kicker">Operations</p><h2>Next actions</h2></div></div>
                <router-link to="/admin/elections/create" class="task-link"><span>Create a new election</span><small>Set positions and candidates</small></router-link>
                <router-link to="/admin/voters" class="task-link"><span>Review voter registry</span><small>{{ stats.total_voters }} voters on record</small></router-link>
                <router-link to="/admin/announcements" class="task-link"><span>Publish an announcement</span><small>Keep voters informed</small></router-link>
            </article>

            <article class="panel recent-panel">
                <div class="panel-heading"><div><p class="panel-kicker">Recent records</p><h2>Latest elections</h2></div><router-link to="/admin/results" class="panel-link">View results</router-link></div>
                <div v-if="recentElections.length" class="recent-list">
                    <div v-for="election in recentElections" :key="election.id" class="recent-row"><div><h3>{{ election.title }}</h3><p>Created {{ formatDate(election.created_at) }}</p></div><span :class="['status-pill', `status-${election.status}`]">{{ election.status }}</span></div>
                </div>
                <div v-else class="panel-loading">No elections created yet.</div>
            </article>
        </section>
    </section>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";

export default {
    name: "AdminDashboard",
    setup() {
        const electionStore = useElectionStore();
        return { electionStore };
    },
    data() {
        return { stats: { total_elections: 0, active_elections: 0, total_voters: 0, total_votes: 0 } };
    },
    computed: {
        loading() { return this.electionStore.isLoading; },
        elections() { return this.electionStore.elections || []; },
        activeElections() { return this.elections.filter((election) => election.status === "active"); },
        completedElections() { return this.elections.filter((election) => election.status !== "active").length; },
        recentElections() { return [...this.elections].sort((first, second) => new Date(second.created_at) - new Date(first.created_at)).slice(0, 4); },
        participationRate() { return this.stats.total_voters ? Math.min(100, Math.round((this.stats.total_votes / this.stats.total_voters) * 100)) : 0; },
        votesPerElection() { return this.stats.total_elections ? Math.round(this.stats.total_votes / this.stats.total_elections) : 0; },
    },
    async mounted() { await this.loadDashboard(); },
    methods: {
        async loadDashboard() {
            try {
                const electionsResponse = await this.electionStore.loadAdminElections();
                const elections = electionsResponse.elections || [];
                this.stats.total_elections = elections.length;
                this.stats.active_elections = elections.filter((election) => election.status === "active").length;
                this.stats.total_votes = elections.reduce((total, election) => total + (election.votes_count || 0), 0);
                await this.electionStore.loadVoters();
                this.stats.total_voters = this.electionStore.voters?.length || 0;
            } catch (error) { console.error("Error loading dashboard:", error); }
        },
        formatDate(date) {
            if (!date) return "recently";
            return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        },
    },
};
</script>

<style scoped>
.admin-dashboard { color: #17231d; }
.dashboard-heading { display: flex; justify-content: space-between; gap: 24px; align-items: end; margin-bottom: 30px; }
.eyebrow, .panel-kicker { margin: 0 0 7px; color: #146c3a; font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; } h1 { margin-bottom: 8px; font-size: 34px; line-height: 1.1; letter-spacing: 0; } .heading-copy { max-width: 590px; margin-bottom: 0; color: #68756d; font-size: 15px; line-height: 1.55; }
.heading-actions { display: flex; flex-wrap: wrap; gap: 10px; }.refresh-button, .create-button { min-height: 40px; border-radius: 6px; padding: 0 14px; font: inherit; font-size: 13px; font-weight: 750; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }.refresh-button { border: 1px solid #cdd8cf; background: #fff; color: #294033; }.refresh-button:disabled { cursor: wait; opacity: .6; }.create-button { background: #146c3a; border: 1px solid #146c3a; color: #fff; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }.metric-card { min-height: 156px; padding: 20px; border: 1px solid #dce5de; border-radius: 8px; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }.metric-card p, .metric-card span { color: #68756d; font-size: 13px; font-weight: 650; }.metric-card p { margin-bottom: 10px; }.metric-card strong { font-size: 35px; line-height: 1; letter-spacing: 0; }.metric-green { border-top: 4px solid #146c3a; }.metric-blue { border-top: 4px solid #2d6a94; }.metric-gold { border-top: 4px solid #b7791f; }.metric-ink { border-top: 4px solid #17231d; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(300px, .9fr); gap: 18px; }.panel { min-width: 0; padding: 22px; border: 1px solid #dce5de; border-radius: 8px; background: #fff; }.panel-heading { display: flex; align-items: start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }.panel-heading h2 { margin-bottom: 0; font-size: 18px; letter-spacing: 0; }.panel-link { color: #146c3a; font-size: 13px; font-weight: 750; text-decoration: none; white-space: nowrap; }
.election-list, .recent-list { display: grid; gap: 3px; }.election-row, .recent-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-top: 1px solid #edf1ed; }.election-status { width: 9px; height: 9px; border-radius: 50%; background: #4f9d69; box-shadow: 0 0 0 4px #e5f3e8; }.election-details, .recent-row > div { flex: 1; min-width: 0; }.election-details h3, .recent-row h3 { margin-bottom: 4px; font-size: 14px; }.election-details p, .recent-row p { margin-bottom: 0; color: #68756d; font-size: 12px; }.row-action { border: 1px solid #cdd8cf; border-radius: 5px; padding: 7px 10px; color: #294033; font-size: 12px; font-weight: 700; text-decoration: none; }.empty-operations, .panel-loading { padding: 26px 0 6px; color: #68756d; font-size: 14px; }.empty-operations p { margin-bottom: 8px; }.empty-operations a { color: #146c3a; font-weight: 750; }
.percentage { color: #146c3a; font-size: 28px; font-weight: 800; line-height: 1; }.progress-track { height: 9px; overflow: hidden; border-radius: 999px; background: #e8eeea; }.progress-value { height: 100%; border-radius: inherit; background: #146c3a; transition: width .3s ease; }.snapshot-list { margin: 22px 0 0; display: grid; gap: 12px; }.snapshot-list div { display: flex; justify-content: space-between; color: #68756d; font-size: 13px; }.snapshot-list dd { margin: 0; color: #17231d; font-weight: 800; }
.action-panel { display: grid; align-content: start; }.task-link { padding: 14px 0; border-top: 1px solid #edf1ed; color: #17231d; text-decoration: none; }.task-link span, .task-link small { display: block; }.task-link span { margin-bottom: 4px; font-size: 14px; font-weight: 750; }.task-link small { color: #68756d; font-size: 12px; }.task-link:hover span { color: #146c3a; }.status-pill { padding: 5px 8px; border-radius: 999px; font-size: 11px; font-weight: 750; text-transform: capitalize; }.status-active { background: #e3f3e7; color: #146c3a; }.status-ended, .status-closed { background: #eef0ee; color: #59665e; }.status-draft { background: #fff2d6; color: #93620d; }
@media (max-width: 1120px) { .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 760px) { .dashboard-heading { align-items: start; flex-direction: column; }.dashboard-grid { grid-template-columns: 1fr; }.heading-actions { width: 100%; }.heading-actions > * { flex: 1; } h1 { font-size: 29px; } } @media (max-width: 460px) { .metrics-grid { grid-template-columns: 1fr; }.panel, .metric-card { padding: 17px; }.recent-row { align-items: start; flex-direction: column; gap: 8px; } }
</style>
