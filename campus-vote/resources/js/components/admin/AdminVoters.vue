<template>
    <div>
        <h1 class="page-title">Voters Management</h1>

        <div v-if="voters.length > 0" class="voters-container">
            <table class="voters-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="voter in voters" :key="voter.id">
                        <td>{{ voter.name }}</td>
                        <td>{{ voter.email }}</td>
                        <td>{{ formatDate(voter.created_at) }}</td>
                        <td>
                            <button
                                @click="deleteVoter(voter.id)"
                                class="btn btn-sm btn-danger"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="empty-state">
            <p>No voters found.</p>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { useNotification } from "../../composables/useNotification.js";
import { useConfirmDialog } from "../../composables/useConfirmDialog.js";

export default {
    name: "AdminVoters",
    setup() {
        const electionStore = useElectionStore();
        const { error: showError, success: showSuccess } = useNotification();
        const { confirmDangerous: showConfirmDangerous } = useConfirmDialog();
        return { electionStore, showError, showSuccess, showConfirmDangerous };
    },
    computed: {
        voters() {
            return this.electionStore.voters;
        },
        loading() {
            return this.electionStore.isLoading;
        },
    },
    mounted() {
        this.loadVoters();
    },
    methods: {
        async loadVoters() {
            try {
                await this.electionStore.loadVoters();
            } catch (error) {
                console.error("Error loading voters:", error);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        async deleteVoter(voterId) {
            const confirmed = await this.showConfirmDangerous(
                "Are you sure you want to delete this voter? This action cannot be undone.",
                {
                    title: "Delete Voter",
                    confirmText: "Delete",
                },
            );

            if (!confirmed) return;

            try {
                await this.electionStore.deleteVoter(voterId);
                this.showSuccess("Voter deleted successfully!");
            } catch (error) {
                console.error("Error deleting voter:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to delete voter";
                this.showError(errorMessage);
            }
        },
    },
};
</script>

<style scoped>
.page-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 30px;
    color: #333;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.voters-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.voters-table {
    width: 100%;
    border-collapse: collapse;
}

.voters-table thead {
    background-color: #f8f9fa;
    border-bottom: 2px solid #ddd;
}

.voters-table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #333;
}

.voters-table td {
    padding: 15px;
    border-bottom: 1px solid #ddd;
}

.voters-table tbody tr:hover {
    background-color: #f8f9fa;
}

.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

.btn-danger {
    background-color: #d73a49;
    color: white;
}

.btn-danger:hover {
    background-color: #cb2431;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
}
</style>
