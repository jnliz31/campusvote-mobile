<template>
    <div class="admin-profile-page">
        <!-- Success / Error Toast -->
        <transition name="toast-fade">
            <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
                <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
                {{ toast.message }}
            </div>
        </transition>

        <div class="profile-grid">
            <!-- Left Column: Avatar Card -->
            <div class="profile-card avatar-card">
                <div class="card-header">
                    <h3 class="card-title">Profile Picture</h3>
                </div>
                <div class="card-body avatar-body">
                    <div class="avatar-wrapper" @click="triggerFileInput">
                        <img
                            v-if="previewUrl || admin.profile_picture_url"
                            :src="previewUrl || admin.profile_picture_url"
                            alt="Profile"
                            class="avatar-image"
                        />
                        <div v-else class="avatar-placeholder">
                            {{ adminInitial }}
                        </div>
                        <div class="avatar-overlay">
                            <span class="overlay-icon">📷</span>
                            <span class="overlay-text">Change</span>
                        </div>
                    </div>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        class="hidden-input"
                        @change="onFileSelected"
                    />
                    <p class="avatar-hint">Click to upload a new picture</p>
                    <p class="avatar-hint-sub">JPG, PNG or WebP • Max 2 MB</p>
                    <transition name="fade">
                        <div v-if="selectedFile" class="avatar-actions">
                            <button
                                class="btn btn-primary btn-sm"
                                :disabled="uploadingPicture"
                                @click="uploadPicture"
                            >
                                {{ uploadingPicture ? 'Uploading…' : 'Save Picture' }}
                            </button>
                            <button
                                class="btn btn-ghost btn-sm"
                                :disabled="uploadingPicture"
                                @click="cancelPicture"
                            >
                                Cancel
                            </button>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- Right Column: Info + Password -->
            <div class="profile-right">
                <!-- Profile Info Card -->
                <div class="profile-card">
                    <div class="card-header">
                        <h3 class="card-title">Profile Information</h3>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="saveProfile">
                            <div class="form-group">
                                <label for="admin-name">Name</label>
                                <input
                                    v-model="form.name"
                                    type="text"
                                    id="admin-name"
                                    class="form-input"
                                    placeholder="Your name"
                                    required
                                />
                                <p v-if="errors.name" class="field-error">{{ errors.name[0] }}</p>
                            </div>
                            <div class="form-group">
                                <label for="admin-email">Email</label>
                                <input
                                    :value="admin.email"
                                    type="email"
                                    id="admin-email"
                                    class="form-input"
                                    disabled
                                />
                                <p class="field-hint">Email cannot be changed</p>
                            </div>
                            <div class="form-group">
                                <label>Member Since</label>
                                <p class="form-static">{{ formatDate(admin.created_at) }}</p>
                            </div>
                            <div class="form-actions">
                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                    :disabled="savingProfile || form.name === admin.name"
                                >
                                    {{ savingProfile ? 'Saving…' : 'Update Name' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Change Password Card -->
                <div class="profile-card">
                    <div class="card-header">
                        <h3 class="card-title">Change Password</h3>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="changePassword">
                            <div class="form-group">
                                <label for="current-password">Current Password</label>
                                <div class="password-wrapper">
                                    <input
                                        v-model="passwordForm.current_password"
                                        :type="showCurrentPassword ? 'text' : 'password'"
                                        id="current-password"
                                        class="form-input"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="password-toggle"
                                        @click="showCurrentPassword = !showCurrentPassword"
                                    >
                                        {{ showCurrentPassword ? '' : '' }}
                                    </button>
                                </div>
                                <p v-if="passwordErrors.current_password" class="field-error">{{ passwordErrors.current_password[0] }}</p>
                            </div>
                            <div class="form-group">
                                <label for="new-password">New Password</label>
                                <div class="password-wrapper">
                                    <input
                                        v-model="passwordForm.password"
                                        :type="showNewPassword ? 'text' : 'password'"
                                        id="new-password"
                                        class="form-input"
                                        placeholder="Minimum 6 characters"
                                        required
                                        minlength="6"
                                    />
                                    <button
                                        type="button"
                                        class="password-toggle"
                                        @click="showNewPassword = !showNewPassword"
                                    >
                                        {{ showNewPassword ? '' : '' }}
                                    </button>
                                </div>
                                <p v-if="passwordErrors.password" class="field-error">{{ passwordErrors.password[0] }}</p>
                            </div>
                            <div class="form-group">
                                <label for="confirm-password">Confirm New Password</label>
                                <div class="password-wrapper">
                                    <input
                                        v-model="passwordForm.password_confirmation"
                                        :type="showConfirmPassword ? 'text' : 'password'"
                                        id="confirm-password"
                                        class="form-input"
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="password-toggle"
                                        @click="showConfirmPassword = !showConfirmPassword"
                                    >
                                        {{ showConfirmPassword ? '' : '' }}
                                    </button>
                                </div>
                                <p v-if="passwordMismatch" class="field-error">Passwords do not match</p>
                            </div>
                            <div class="form-actions">
                                <button
                                    type="submit"
                                    class="btn btn-warning"
                                    :disabled="changingPassword || !passwordFormValid"
                                >
                                    {{ changingPassword ? 'Changing…' : 'Change Password' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";
import { adminAPI } from "../../services/api.js";

export default {
    name: "AdminProfile",
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            // Profile form
            form: { name: "" },
            errors: {},
            savingProfile: false,

            // Picture upload
            selectedFile: null,
            previewUrl: null,
            uploadingPicture: false,

            // Password form
            passwordForm: {
                current_password: "",
                password: "",
                password_confirmation: "",
            },
            passwordErrors: {},
            changingPassword: false,
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,

            // Toast notification
            toast: { show: false, message: "", type: "success" },
            toastTimeout: null,
        };
    },
    computed: {
        admin() {
            return this.authStore.user || { name: "", email: "", created_at: new Date() };
        },
        adminInitial() {
            return (this.admin.name || "A").trim().charAt(0).toUpperCase();
        },
        passwordMismatch() {
            return (
                this.passwordForm.password &&
                this.passwordForm.password_confirmation &&
                this.passwordForm.password !== this.passwordForm.password_confirmation
            );
        },
        passwordFormValid() {
            return (
                this.passwordForm.current_password &&
                this.passwordForm.password &&
                this.passwordForm.password.length >= 6 &&
                this.passwordForm.password_confirmation &&
                !this.passwordMismatch
            );
        },
    },
    mounted() {
        this.form.name = this.admin.name || "";
    },
    watch: {
        "admin.name"(newVal) {
            if (!this.savingProfile) {
                this.form.name = newVal || "";
            }
        },
    },
    methods: {
        formatDate(date) {
            if (!date) return "N/A";
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        },

        showToast(message, type = "success") {
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toast = { show: true, message, type };
            this.toastTimeout = setTimeout(() => {
                this.toast.show = false;
            }, 4000);
        },

        // --- Profile Picture ---
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        onFileSelected(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate client-side
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                this.showToast("Please select a JPG, PNG, or WebP image.", "error");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                this.showToast("Image must be smaller than 2 MB.", "error");
                return;
            }

            this.selectedFile = file;
            this.previewUrl = URL.createObjectURL(file);
        },
        cancelPicture() {
            this.selectedFile = null;
            if (this.previewUrl) {
                URL.revokeObjectURL(this.previewUrl);
                this.previewUrl = null;
            }
            this.$refs.fileInput.value = "";
        },
        async uploadPicture() {
            if (!this.selectedFile) return;
            this.uploadingPicture = true;

            try {
                const formData = new FormData();
                formData.append("profile_picture", this.selectedFile);

                const response = await adminAPI.updateProfilePicture(formData);

                if (response.data.success) {
                    this.authStore.updateUserData(response.data.admin);
                    this.showToast("Profile picture updated!");
                    this.cancelPicture();
                } else {
                    this.showToast(response.data.message || "Upload failed.", "error");
                }
            } catch (error) {
                const msg =
                    error.response?.data?.errors?.profile_picture?.[0] ||
                    error.response?.data?.message ||
                    "Failed to upload picture.";
                this.showToast(msg, "error");
            } finally {
                this.uploadingPicture = false;
            }
        },

        // --- Profile Info ---
        async saveProfile() {
            if (!this.form.name.trim()) {
                this.errors = { name: ["Name is required."] };
                return;
            }
            this.errors = {};
            this.savingProfile = true;

            try {
                const response = await adminAPI.updateProfile({ name: this.form.name.trim() });
                if (response.data.success) {
                    this.authStore.updateUserData(response.data.admin);
                    this.showToast("Name updated successfully!");
                }
            } catch (error) {
                if (error.response?.data?.errors) {
                    this.errors = error.response.data.errors;
                } else {
                    this.showToast("Failed to update profile.", "error");
                }
            } finally {
                this.savingProfile = false;
            }
        },

        // --- Password ---
        async changePassword() {
            if (!this.passwordFormValid) return;
            this.passwordErrors = {};
            this.changingPassword = true;

            try {
                const response = await adminAPI.updatePassword(this.passwordForm);
                if (response.data.success) {
                    this.showToast("Password changed successfully!");
                    this.passwordForm = {
                        current_password: "",
                        password: "",
                        password_confirmation: "",
                    };
                }
            } catch (error) {
                if (error.response?.data?.errors) {
                    this.passwordErrors = error.response.data.errors;
                } else {
                    this.showToast("Failed to change password.", "error");
                }
            } finally {
                this.changingPassword = false;
            }
        },
    },
    beforeUnmount() {
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
    },
};
</script>

<style scoped>
/* ── Layout ── */
.admin-profile-page {
    position: relative;
}

.profile-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 28px;
    align-items: start;
}

.profile-right {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

/* ── Cards ── */
.profile-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e2e8e4;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.card-header {
    padding: 20px 24px;
    border-bottom: 1px solid #eef1ee;
}

.card-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1a2e22;
    letter-spacing: -0.01em;
}

.card-body {
    padding: 24px;
}

/* ── Avatar Card ── */
.avatar-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px;
}

.avatar-wrapper {
    position: relative;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    cursor: pointer;
    overflow: hidden;
    border: 4px solid #e8f0ea;
    transition: border-color 0.3s, transform 0.2s;
}

.avatar-wrapper:hover {
    border-color: #146c3a;
    transform: scale(1.03);
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #146c3a, #1a8a4a);
    color: #fff;
    font-size: 56px;
    font-weight: 700;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.25s;
}

.avatar-wrapper:hover .avatar-overlay {
    opacity: 1;
}

.overlay-icon {
    font-size: 28px;
    margin-bottom: 4px;
}

.overlay-text {
    color: #fff;
    font-size: 13px;
    font-weight: 600;
}

.hidden-input {
    display: none;
}

.avatar-hint {
    margin: 18px 0 4px;
    font-size: 13px;
    color: #5a6b60;
    font-weight: 500;
}

.avatar-hint-sub {
    margin: 0;
    font-size: 12px;
    color: #8a9b90;
}

.avatar-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
}

/* ── Form ── */
.form-group {
    margin-bottom: 22px;
}

.form-group label {
    display: block;
    margin-bottom: 7px;
    font-size: 13px;
    font-weight: 600;
    color: #3a4d40;
}

.form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #d4ddd6;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #1a2e22;
    background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #146c3a;
    box-shadow: 0 0 0 3px rgba(20, 108, 58, 0.1);
}

.form-input:disabled {
    background: #f4f7f5;
    color: #7a8b80;
    cursor: not-allowed;
}

.form-static {
    margin: 0;
    font-size: 14px;
    color: #5a6b60;
    padding: 11px 0 0;
}

.field-error {
    margin: 6px 0 0;
    font-size: 12px;
    color: #d32f2f;
    font-weight: 500;
}

.field-hint {
    margin: 6px 0 0;
    font-size: 12px;
    color: #8a9b90;
}

.form-actions {
    padding-top: 4px;
}

/* ── Password Toggle ── */
.password-wrapper {
    position: relative;
}

.password-wrapper .form-input {
    padding-right: 44px;
}

.password-toggle {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 6px 8px;
    line-height: 1;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.password-toggle:hover {
    opacity: 1;
}

/* ── Buttons ── */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 22px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: #146c3a;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #0f5a2f;
}

.btn-warning {
    background: #e67e22;
    color: #fff;
}

.btn-warning:hover:not(:disabled) {
    background: #cf6d17;
}

.btn-ghost {
    background: transparent;
    color: #5a6b60;
    border: 1px solid #d4ddd6;
}

.btn-ghost:hover:not(:disabled) {
    background: #f4f7f5;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 12px;
}

/* ── Toast ── */
.toast {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    padding: 14px 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    animation: toast-in 0.35s ease;
}

.toast-icon {
    font-size: 16px;
    font-weight: 800;
}

.toast-success {
    background: #146c3a;
    color: #fff;
}

.toast-error {
    background: #d32f2f;
    color: #fff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: all 0.35s ease;
}

.toast-fade-enter-from {
    opacity: 0;
    transform: translateY(-16px);
}

.toast-fade-leave-to {
    opacity: 0;
    transform: translateX(40px);
}

@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateY(-16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ── Fade transition ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 820px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }

    .avatar-wrapper {
        width: 130px;
        height: 130px;
    }

    .avatar-placeholder {
        font-size: 44px;
    }
}
</style>
