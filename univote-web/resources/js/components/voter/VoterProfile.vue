<template>
    <div>
        <h1 class="page-title">My Profile</h1>

        <div class="profile-container">
            <div v-if="!isEditing" class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        {{ voter.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">{{ voter.name }}</h2>
                        <p class="profile-email">{{ voter.email }}</p>
                    </div>
                </div>

                <div class="profile-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">{{ voter.email }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Student ID:</span>
                        <span class="detail-value">{{
                            voter.student_id || "N/A"
                        }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Member Since:</span>
                        <span class="detail-value">{{
                            formatDate(voter.created_at)
                        }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Votes Cast:</span>
                        <span class="detail-value">{{
                            voter.votes_count || 0
                        }}</span>
                    </div>
                </div>

                <div class="profile-actions">
                    <button @click="editProfile" class="btn btn-primary">
                        Edit Profile
                    </button>
                    <button @click="changePassword" class="btn btn-secondary">
                        Change Password
                    </button>
                </div>
            </div>

            <div v-else class="profile-card edit-card">
                <div class="profile-header edit-header">
                    <h2 class="profile-name">Edit Profile</h2>
                </div>

                <form @submit.prevent="saveProfile" class="profile-form">
                    <div class="form-group">
                        <label for="name">Full Name:</label>
                        <input
                            v-model="editForm.name"
                            type="text"
                            id="name"
                            class="form-input"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input
                            v-model="editForm.email"
                            type="email"
                            id="email"
                            class="form-input"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="student_id">Student ID:</label>
                        <input
                            v-model="editForm.student_id"
                            type="text"
                            id="student_id"
                            class="form-input"
                        />
                    </div>

                    <div v-if="editError" class="form-error">
                        {{ editError }}
                    </div>

                    <div class="form-actions">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            :disabled="updateLoading"
                        >
                            {{ updateLoading ? "Saving..." : "Save Changes" }}
                        </button>
                        <button
                            type="button"
                            @click="cancelEdit"
                            class="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";
import { useNotification } from "../../composables/useNotification.js";
import { voterAPI } from "../../services/api.js";

export default {
    name: "VoterProfile",
    setup() {
        const authStore = useAuthStore();
        const { info: showInfo } = useNotification();
        return { authStore, showInfo };
    },
    data() {
        return {
            isEditing: false,
            updateLoading: false,
            editError: "",
            editForm: {
                name: "",
                email: "",
                student_id: "",
            },
        };
    },
    computed: {
        voter() {
            return (
                this.authStore.user || {
                    name: "",
                    email: "",
                    student_id: "",
                    created_at: new Date(),
                    votes_count: 0,
                }
            );
        },
        loading() {
            return this.authStore.isLoading;
        },
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        },
        editProfile() {
            this.editForm = {
                name: this.voter.name,
                email: this.voter.email,
                student_id: this.voter.student_id || "",
            };
            this.editError = "";
            this.isEditing = true;
        },
        cancelEdit() {
            this.isEditing = false;
            this.editError = "";
            this.editForm = {
                name: "",
                email: "",
                student_id: "",
            };
        },
        async saveProfile() {
            this.editError = "";

            if (!this.editForm.name.trim()) {
                this.editError = "Name is required";
                return;
            }

            if (!this.editForm.email.trim()) {
                this.editError = "Email is required";
                return;
            }

            this.updateLoading = true;

            try {
                const response = await voterAPI.updateProfile({
                    name: this.editForm.name,
                    email: this.editForm.email,
                    student_id: this.editForm.student_id,
                });

                if (response.data.success) {
                    // Update auth store with new user data
                    this.authStore.updateUserData(response.data.voter);
                    this.isEditing = false;
                    this.showInfo("Profile updated successfully!");
                } else {
                    this.editError =
                        response.data.message || "Failed to update profile";
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                this.editError =
                    error.response?.data?.message ||
                    "Failed to update profile. Please try again.";
            } finally {
                this.updateLoading = false;
            }
        },
        changePassword() {
            this.showInfo("Password change feature coming soon");
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
    font-size: 16px;
}

.profile-container {
    max-width: 600px;
}

.profile-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.profile-header {
    background: linear-gradient(135deg, #116b27, #22863a);
    color: white;
    padding: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
}

.profile-avatar {
    width: 80px;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 600;
    flex-shrink: 0;
}

.profile-info {
    flex: 1;
}

.profile-name {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.profile-email {
    margin: 5px 0 0 0;
    opacity: 0.9;
    font-size: 14px;
}

.profile-details {
    padding: 30px;
    border-bottom: 1px solid #eee;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.detail-value {
    color: #666;
    font-size: 14px;
}

.profile-actions {
    padding: 20px 30px;
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
    flex: 1;
    text-align: center;
}

.btn-primary {
    background-color: #0366d6;
    color: white;
}

.btn-primary:hover {
    background-color: #0256c1;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.edit-card {
    max-width: 600px;
}

.edit-header {
    padding: 25px 30px;
}

.profile-form {
    padding: 30px;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #0366d6;
    box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.form-error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
}

.form-actions .btn {
    flex: 1;
}
</style>
