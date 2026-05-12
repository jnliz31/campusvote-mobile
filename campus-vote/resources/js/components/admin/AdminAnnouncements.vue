<template>
    <div>
        <div class="page-header">
            <h1 class="page-title">Announcements</h1>
            <button 
                @click="showForm = !showForm" 
                class="btn btn-primary"
                :disabled="loading || deletingId !== null || loadingAnnouncements"
            >
                {{ showForm ? "Cancel" : "Add Announcement" }}
            </button>
        </div>

        <div v-if="showForm" class="form-container">
            <form @submit.prevent="saveAnnouncement">
                <div class="form-group">
                    <label>Announcement Content:</label>
                    <textarea
                        v-model="form.content"
                        rows="4"
                        required
                        :disabled="loading"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                >
                    {{ loading ? "Saving..." : "Post Announcement" }}
                </button>
            </form>
        </div>

        <div v-if="loadingAnnouncements" class="loading">
            Loading announcements...
        </div>
        <div
            v-else-if="announcements.length > 0"
            class="announcements-container"
        >
            <div
                v-for="announcement in announcements"
                :key="announcement.id"
                class="announcement-card"
            >
                <div class="announcement-content">
                    {{ announcement.content }}
                </div>
                <div class="announcement-time">
                    {{ formatDate(announcement.created_at) }}
                </div>
                <div class="announcement-actions">
                    <button
                        @click="deleteAnnouncement(announcement.id)"
                        class="btn btn-sm btn-danger"
                        :disabled="deletingId === announcement.id"
                    >
                        {{ deletingId === announcement.id ? "Deleting..." : "Delete" }}
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="empty-state">
            <p>No announcements yet.</p>
        </div>
    </div>
</template>

<script>
import { useElectionStore } from "../../stores/electionStore.js";
import { useNotification } from "../../composables/useNotification.js";
import { useConfirmDialog } from "../../composables/useConfirmDialog.js";

export default {
    name: "AdminAnnouncements",
    setup() {
        const electionStore = useElectionStore();
        const { error: showError, success: showSuccess } = useNotification();
        const { confirmDangerous: showConfirmDangerous } = useConfirmDialog();
        return { electionStore, showError, showSuccess, showConfirmDangerous };
    },
    data() {
        return {
            form: { content: "" },
            showForm: false,
            loading: false,
            deletingId: null,
            submitting: false,
        };
    },
    computed: {
        announcements() {
            return this.electionStore.announcements;
        },
        loadingAnnouncements() {
            return this.electionStore.isLoading;
        },
        isAnyOperationInProgress() {
            return this.loading || this.deletingId !== null || this.submitting;
        },
    },
    mounted() {
        this.loadAnnouncements();
    },
    methods: {
        async loadAnnouncements() {
            try {
                await this.electionStore.loadAdminAnnouncements();
            } catch (error) {
                console.error("Error loading announcements:", error);
            }
        },
        async saveAnnouncement() {
            // Prevent duplicate submissions
            if (this.submitting || this.loading) {
                return;
            }

            if (!this.form.content.trim()) {
                this.showError("Please enter announcement content");
                return;
            }

            this.loading = true;
            this.submitting = true;

            try {
                await this.electionStore.createAnnouncement({
                    content: this.form.content,
                });
                this.form.content = "";
                this.showForm = false;
                this.showSuccess("Announcement posted successfully!");
            } catch (error) {
                console.error("Error saving announcement:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to post announcement";
                this.showError(errorMessage);
            } finally {
                this.loading = false;
                this.submitting = false;
            }
        },
        async deleteAnnouncement(announcementId) {
            // Prevent duplicate deletions
            if (this.deletingId !== null || this.loading || this.submitting) {
                return;
            }

            const confirmed = await this.showConfirmDangerous(
                "Are you sure you want to delete this announcement? This action cannot be undone.",
                {
                    title: "Delete Announcement",
                    confirmText: "Delete",
                },
            );

            if (!confirmed) return;

            // Double-check after confirmation that no other operation is in progress
            if (this.isAnyOperationInProgress) {
                return;
            }

            this.deletingId = announcementId;

            try {
                await this.electionStore.deleteAnnouncement(announcementId);
                this.showSuccess("Announcement deleted successfully!");
            } catch (error) {
                console.error("Error deleting announcement:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to delete announcement";
                this.showError(errorMessage);
            } finally {
                this.deletingId = null;
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        },
    },
};
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.page-title {
    font-size: 32px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.form-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
}

.form-group textarea:focus {
    outline: none;
    border-color: #116b27;
    box-shadow: 0 0 0 3px rgba(17, 107, 39, 0.1);
}

.form-group textarea:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.announcements-container {
    display: grid;
    gap: 15px;
}

.announcement-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #116b27;
}

.announcement-content {
    font-size: 15px;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.5;
}

.announcement-time {
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
}

.announcement-actions {
    display: flex;
    gap: 10px;
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

.btn-primary:hover:not(:disabled) {
    background-color: #0256c1;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
}

.btn-danger {
    background-color: #d73a49;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background-color: #cb2431;
}

.btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
}
</style>
