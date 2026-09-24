<template>
    <div class="announcements-management">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title-section">
                    <div class="header-icon-wrap">
                        <svg class="header-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="page-title">Announcements</h1>
                        <p class="page-subtitle">Communicate updates to all voters or specific organizations</p>
                    </div>
                </div>
                <button 
                    @click="toggleForm" 
                    class="btn btn-create"
                    :disabled="loading || deletingId !== null || loadingAnnouncements"
                >
                    <svg v-if="!showForm" class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <svg v-else class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {{ showForm ? "Cancel" : "Add Announcement" }}
                </button>
            </div>
        </div>

        <!-- Create / Edit Form -->
        <transition name="fade-slide">
            <div v-if="showForm" class="form-card">
                <div class="form-header">
                    <h2>{{ isEditing ? 'Edit Announcement' : 'Create New Announcement' }}</h2>
                </div>
                <form @submit.prevent="saveAnnouncement">
                    <div class="form-row">
                        <div class="form-group flex-2">
                            <label>Title (Optional)</label>
                            <input
                                v-model="form.title"
                                type="text"
                                placeholder="E.g., System Maintenance"
                                class="form-input"
                                :disabled="loading"
                            />
                        </div>
                        <div class="form-group flex-1">
                            <label>Type</label>
                            <select v-model="form.type" class="form-select" :disabled="loading">
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="success">Success</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Target Audience</label>
                        <select v-model="form.organization_id" class="form-select" :disabled="loading">
                            <option value="">All Organizations (Global Announcement)</option>
                            <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                                {{ org.name }} ({{ org.code }})
                            </option>
                        </select>
                        <small class="form-help">Select who will see this announcement on their dashboard.</small>
                    </div>

                    <div class="form-group">
                        <label>Message Content *</label>
                        <textarea
                            v-model="form.content"
                            rows="4"
                            placeholder="Type your announcement here..."
                            required
                            class="form-textarea"
                            :disabled="loading"
                        ></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" @click="toggleForm" :disabled="loading">Cancel</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <svg v-if="loading" class="spin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <svg v-else class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            {{ loading ? "Saving..." : (isEditing ? "Update Announcement" : "Post Announcement") }}
                        </button>
                    </div>
                </form>
            </div>
        </transition>

        <!-- Loading State -->
        <div v-if="loadingAnnouncements" class="loading-container">
            <div class="spinner"></div>
            <p>Loading announcements...</p>
        </div>

        <!-- Announcements List -->
        <div v-else-if="announcements.length > 0" class="announcements-grid">
            <div
                v-for="announcement in announcements"
                :key="announcement.id"
                class="announcement-card"
                :class="[`type-${announcement.type || 'info'}`]"
            >
                <!-- Target Badge -->
                <div class="announcement-target">
                    <span v-if="announcement.organization" class="badge badge-org">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2V4Zm3 1h2v2H7V5Zm2 4H7v2h2V9Zm2-4h2v2h-2V5Zm2 4h-2v2h2V9Z" />
                        </svg>
                        {{ announcement.organization.code }}
                    </span>
                    <span v-else class="badge badge-global">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM4.205 11.5a5.955 5.955 0 0 1-.2-1.5c0-.508.063-1.002.182-1.478l4.475 2.237a.5.5 0 0 1 .274.453v3.743a5.98 5.98 0 0 1-4.731-3.455ZM10 17.94V14.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H11a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1.341c.21 0 .408.1.536.265l1.621 2.08A5.982 5.982 0 0 1 10 17.94ZM16.326 9H15a.5.5 0 0 1-.5-.5V7a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1-.5-.5V4.707a5.98 5.98 0 0 1 4.826 4.293Z" />
                        </svg>
                        Global
                    </span>
                    <span class="announcement-date">{{ formatDate(announcement.created_at) }}</span>
                </div>

                <div class="announcement-body">
                    <div class="type-icon">
                        <svg v-if="announcement.type === 'warning'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>
                        <svg v-else-if="announcement.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                    </div>
                    <div class="content-wrapper">
                        <h3 v-if="announcement.title" class="announcement-title">{{ announcement.title }}</h3>
                        <p class="announcement-text">{{ announcement.content }}</p>
                    </div>
                </div>

                <div class="announcement-footer">
                    <span class="admin-badge" v-if="announcement.admin">
                        By {{ announcement.admin.name }}
                    </span>
                    <span v-else></span>
                    
                    <div class="action-buttons">
                        <button 
                            @click="editAnnouncement(announcement)" 
                            class="btn-icon-only btn-edit-icon"
                            title="Edit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            @click="deleteAnnouncement(announcement.id)"
                            class="btn-icon-only btn-delete-icon"
                            :disabled="deletingId === announcement.id"
                            title="Delete"
                        >
                            <svg v-if="deletingId === announcement.id" class="spin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                </svg>
            </div>
            <h3>No Announcements</h3>
            <p>You haven't posted any announcements yet.</p>
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
            form: { 
                id: null,
                title: "",
                content: "",
                type: "info",
                organization_id: "" 
            },
            showForm: false,
            isEditing: false,
            loading: false,
            deletingId: null,
            submitting: false,
        };
    },
    computed: {
        announcements() {
            return this.electionStore.announcements;
        },
        availableOrgs() {
            return this.electionStore.announcementOrganizations || [];
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
        toggleForm() {
            if (this.showForm) {
                this.resetForm();
            } else {
                this.showForm = true;
            }
        },
        resetForm() {
            this.form = { id: null, title: "", content: "", type: "info", organization_id: "" };
            this.isEditing = false;
            this.showForm = false;
        },
        editAnnouncement(announcement) {
            this.form = {
                id: announcement.id,
                title: announcement.title || "",
                content: announcement.content,
                type: announcement.type || "info",
                organization_id: announcement.organization_id || ""
            };
            this.isEditing = true;
            this.showForm = true;
            // Scroll to top where form is
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        async saveAnnouncement() {
            if (this.submitting || this.loading) return;

            if (!this.form.content.trim()) {
                this.showError("Please enter announcement content");
                return;
            }

            this.loading = true;
            this.submitting = true;

            try {
                const data = {
                    title: this.form.title,
                    content: this.form.content,
                    type: this.form.type,
                    organization_id: this.form.organization_id || null
                };

                if (this.isEditing && this.form.id) {
                    await this.electionStore.updateAnnouncement(this.form.id, data);
                    this.showSuccess("Announcement updated successfully!");
                } else {
                    await this.electionStore.createAnnouncement(data);
                    this.showSuccess("Announcement posted successfully!");
                }
                
                this.resetForm();
            } catch (error) {
                console.error("Error saving announcement:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to save announcement";
                this.showError(errorMessage);
            } finally {
                this.loading = false;
                this.submitting = false;
            }
        },
        async deleteAnnouncement(announcementId) {
            if (this.deletingId !== null || this.loading || this.submitting) return;

            const confirmed = await this.showConfirmDangerous(
                "Are you sure you want to delete this announcement? This action cannot be undone.",
                { title: "Delete Announcement", confirmText: "Delete" }
            );

            if (!confirmed) return;
            if (this.isAnyOperationInProgress) return;

            this.deletingId = announcementId;

            try {
                await this.electionStore.deleteAnnouncement(announcementId);
                this.showSuccess("Announcement deleted successfully!");
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Failed to delete announcement";
                this.showError(errorMessage);
            } finally {
                this.deletingId = null;
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
            });
        },
    },
};
</script>

<style scoped>
.announcements-management {
    padding: 0;
}

/* ==================== Header ==================== */
.page-header {
    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
    border-radius: 18px;
    padding: 36px 40px;
    margin-bottom: 28px;
    box-shadow: 0 8px 32px rgba(15, 32, 39, 0.22);
    position: relative;
    overflow: hidden;
}

.page-header::before, .page-header::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
}
.page-header::before { top: -40px; right: -40px; width: 200px; height: 200px; }
.page-header::after { bottom: -60px; left: -20px; width: 180px; height: 180px; }

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
    background: rgba(255,255,255,0.12);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    color: white;
}

.header-icon-svg { width: 32px; height: 32px; }

.page-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 4px;
    color: #fff;
    letter-spacing: -0.5px;
}

.page-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    margin: 0;
}

.btn-create {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.3);
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-create:hover:not(:disabled) {
    background: rgba(255,255,255,0.25);
    transform: translateY(-2px);
}
.btn-icon-svg { width: 18px; height: 18px; }

/* ==================== Form ==================== */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.form-card {
    background: #fff;
    border-radius: 18px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin-bottom: 30px;
    border: 1px solid #f0f0f0;
}

.form-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}
.form-header h2 { font-size: 20px; font-weight: 700; margin: 0; color: #333; }

.form-row {
    display: flex;
    gap: 20px;
}
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-group {
    margin-bottom: 20px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    color: #444;
}

.form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 10px;
    font-size: 14px;
    color: #333;
    font-family: inherit;
    transition: all 0.2s;
    box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: #2c5364;
    box-shadow: 0 0 0 3px rgba(44, 83, 100, 0.1);
}

.form-help {
    display: block;
    margin-top: 6px;
    color: #888;
    font-size: 12px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
}

.btn {
    padding: 10px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
    background: #f5f5f5;
    color: #555;
    border: 1px solid #e0e0e0;
}
.btn-secondary:hover:not(:disabled) { background: #e0e0e0; }

.btn-primary {
    background: #2c5364;
    color: #fff;
    border: 1px solid transparent;
}
.btn-primary:hover:not(:disabled) { background: #1a323c; }

.btn-icon { width: 18px; height: 18px; }
.spin-icon { width: 18px; height: 18px; animation: spin 1s linear infinite; }

/* ==================== Grid & Cards ==================== */
.announcements-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}
@media (max-width: 768px) {
    .announcements-grid { grid-template-columns: 1fr; }
    .form-row { flex-direction: column; gap: 0; }
}

.announcement-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
    border-left: 5px solid #2c5364;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
}

.announcement-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.type-info { border-left-color: #3b82f6; }
.type-warning { border-left-color: #f59e0b; }
.type-success { border-left-color: #10b981; }

.announcement-target {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}
.badge svg { width: 12px; height: 12px; }

.badge-global { background: #e0f2fe; color: #0284c7; }
.badge-org { background: #f3e8ff; color: #7e22ce; }

.announcement-date {
    font-size: 12px;
    color: #999;
    font-weight: 500;
}

.announcement-body {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex: 1;
}

.type-icon {
    flex-shrink: 0;
    width: 24px; height: 24px;
}
.type-info .type-icon { color: #3b82f6; }
.type-warning .type-icon { color: #f59e0b; }
.type-success .type-icon { color: #10b981; }

.content-wrapper { flex: 1; }

.announcement-title {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #222;
}

.announcement-text {
    margin: 0;
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    white-space: pre-wrap;
}

.announcement-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f5f5f5;
    margin-top: auto;
}

.admin-badge {
    font-size: 12px;
    color: #888;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-icon-only {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-icon-only svg { width: 16px; height: 16px; }

.btn-edit-icon {
    background: #f3f4f6; color: #4b5563;
}
.btn-edit-icon:hover { background: #e5e7eb; color: #111827; }

.btn-delete-icon {
    background: #fee2e2; color: #ef4444;
}
.btn-delete-icon:hover { background: #fecaca; color: #b91c1c; }

/* ==================== Loading & Empty ==================== */
.loading-container {
    text-align: center;
    padding: 60px 20px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.spinner {
    width: 40px; height: 40px;
    border: 3px solid #f3f4f6;
    border-top-color: #2c5364;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.empty-icon {
    color: #cbd5e1;
    margin-bottom: 16px;
}
.empty-icon svg { width: 64px; height: 64px; margin: 0 auto; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #334155; margin: 0 0 8px; }
.empty-state p { color: #64748b; font-size: 14px; margin: 0; }
</style>
