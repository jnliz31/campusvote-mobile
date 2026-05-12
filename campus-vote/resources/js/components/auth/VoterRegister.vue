<template>
    <div class="auth-container">
        <div class="auth-left">
            <div class="logo-box">
                <div class="logo-icon">
                    <img src="/images/download.webp" alt="Campusvote-logo" />
                </div>
            </div>

            <div class="info-description">
                Join Campus Vote and participate in student elections. Register
                with your email to get started.
            </div>
        </div>

        <div class="auth-right">
            <div class="login-card">
                <h1 class="login-title">Student Registration</h1>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div v-if="success" class="success-message">
                    {{ success }}
                </div>

                <form @submit.prevent="register">
                    <div class="form-group">
                        <input
                            v-model="name"
                            type="text"
                            class="form-input"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <input
                            v-model="email"
                            type="email"
                            class="form-input"
                            placeholder="Student Email"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <input
                            v-model="password"
                            type="password"
                            class="form-input"
                            placeholder="Password"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <input
                            v-model="passwordConfirm"
                            type="password"
                            class="form-input"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>

                    <button type="submit" class="btn-login" :disabled="loading">
                        {{ loading ? "Registering..." : "Register" }}
                    </button>
                </form>

                <div class="login-footer">
                    <router-link to="/voter/login" class="login-link"
                        >Already have an account? Login</router-link
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";

export default {
    name: "VoterRegister",
    data() {
        return {
            name: "",
            email: "",
            password: "",
            passwordConfirm: "",
            loading: false,
            error: "",
            success: "",
        };
    },
    methods: {
        async register() {
            this.error = "";
            this.success = "";

            if (this.password !== this.passwordConfirm) {
                this.error = "Passwords do not match";
                return;
            }

            const authStore = useAuthStore();
            this.loading = true;

            try {
                await authStore.voterRegister({
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    password_confirmation: this.passwordConfirm,
                });

                this.success =
                    "Registration successful! Redirecting to dashboard...";

                setTimeout(() => {
                    this.$router.push("/voter/dashboard");
                }, 500);
            } catch (error) {
                this.error =
                    error.response?.data?.message ||
                    "Registration failed. Please try again.";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.auth-container {
    display: flex;
    min-height: 100vh;
}

.auth-left {
    flex: 1;
    background-color: #e8e8e8;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
}

.logo-box {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
}

.logo-icon {
    width: 200px;
    height: 200px;
    background-color: #22863a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.logo-icon img {
    width: 75%;
    height: 75%;
    object-fit: contain;
    border-radius: 8px;
}

.info-description {
    font-size: 16px;
    color: #666;
    text-align: center;
    max-width: 500px;
    line-height: 1.6;
}

.auth-right {
    flex: 1;
    background-color: #1e5128;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
}

.login-card {
    background: white;
    padding: 50px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
    color: #333;
}

.form-group {
    margin-bottom: 20px;
}

.form-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
}

.form-input:focus {
    outline: none;
    border-color: #22863a;
}

.btn-login {
    width: 100%;
    padding: 14px;
    background-color: #22863a;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-login:hover:not(:disabled) {
    background-color: #1a6b2e;
}

.btn-login:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    background-color: #fee;
    color: #c33;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
}

.success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
}

.login-footer {
    text-align: center;
    margin-top: 20px;
}

.login-link {
    color: #22863a;
    text-decoration: none;
}

.login-link:hover {
    text-decoration: underline;
}

@media (max-width: 1024px) {
    .auth-left {
        flex: 0 0 40%;
    }

    .auth-right {
        flex: 1;
    }
}

@media (max-width: 768px) {
    .auth-container {
        flex-direction: column;
    }

    .auth-left {
        flex: 1;
        min-height: 200px;
    }

    .auth-right {
        flex: 1;
    }

    .login-card {
        padding: 30px;
    }

    .login-title {
        font-size: 24px;
    }
}
</style>
