<template>
    <div class="auth-container">
        <div class="auth-left">
            <div class="logo-box">
                <div class="logo-icon">
                    <img src="/images/download.webp" alt="Campusvote-logo" />
                </div>
            </div>

            <div class="info-description">
                Campus Vote is your online student election platform. Log in to
                view candidates, cast your vote securely, and make your voice
                heard on campus decisions. Your vote counts!
            </div>
        </div>

        <div class="auth-right">
            <div class="login-card">
                <h1 class="login-title">Student Login</h1>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div v-if="success" class="success-message">
                    {{ success }}
                </div>

                <!-- Traditional Login Form -->
                <form @submit.prevent="login">
                    <div class="form-group">
                        <input
                            v-model="email"
                            type="email"
                            name="email"
                            class="form-input"
                            placeholder="Student Email"
                            required
                            autofocus
                        />
                    </div>

                    <div class="form-group">
                        <input
                            v-model="password"
                            type="password"
                            name="password"
                            class="form-input"
                            placeholder="Password"
                            required
                        />
                    </div>

                    <button type="submit" class="btn-login" :disabled="loading">
                        {{ loading ? "Logging in..." : "Login" }}
                    </button>
                </form>

                <div class="divider">
                    <span>or continue with email</span>
                </div>

                <!-- Google Sign-In Button -->
                <a href="/voter/auth/google" class="btn-google">
                    <svg
                        class="google-icon"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                    >
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Gmail
                </a>

                <div class="login-footer">
                    <router-link to="/voter/register" class="login-link"
                        >Don't have an account? Register</router-link
                    >
                    <br />
                    <router-link to="/admin/login" class="login-link"
                        >Login as Admin</router-link
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";

export default {
    name: "VoterLogin",
    data() {
        return {
            email: "",
            password: "",
            loading: false,
            error: "",
            success: "",
        };
    },
    methods: {
        async login() {
            // Validate inputs
            if (!this.email || !this.password) {
                this.error = "Please enter both email and password";
                return;
            }

            const authStore = useAuthStore();
            this.loading = true;
            this.error = "";
            this.success = "";

            try {
                await authStore.voterLogin(this.email, this.password);

                this.success = "Login successful! Redirecting...";

                // Redirect to voter dashboard
                setTimeout(() => {
                    this.$router.push("/voter/dashboard");
                }, 500);
            } catch (error) {
                console.error("Login error:", error);

                // Check for specific error responses
                if (error.response?.status === 401) {
                    this.error =
                        error.response?.data?.message ||
                        "Invalid email or password";
                } else if (error.response?.status === 422) {
                    // Validation error
                    const errors = error.response?.data?.errors;
                    if (errors) {
                        this.error = Object.values(errors).flat().join(", ");
                    } else {
                        this.error = "Please check your input and try again";
                    }
                } else if (error.response?.status >= 500) {
                    this.error = "Server error. Please try again later.";
                } else {
                    this.error =
                        error.response?.data?.message ||
                        "An error occurred. Please try again.";
                }
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

.divider {
    text-align: center;
    margin: 20px 0;
    position: relative;
}

.divider span {
    background: white;
    padding: 0 10px;
    color: #999;
    font-size: 12px;
}

.divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #ddd;
    z-index: -1;
}

.btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 20px;
    margin-bottom: 20px;
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #3c4043;
    text-decoration: none;
    transition: all 0.3s;
    gap: 8px;
}

.btn-google:hover {
    background: #f8f9fa;
    border-color: #dadce0;
}

.google-icon {
    width: 20px;
    height: 20px;
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
