<template>
    <div class="auth-container">
        <div class="auth-left">
            <div class="logo-box">
                <div class="logo-icon">
                    <img src="/images/download.webp" alt="Campusvote-logo" />
                </div>
            </div>

            <div class="info-description">
                Admin Portal for Campus Vote. Manage elections, voters, and view
                results. Access restricted to authorized administrators only.
            </div>
        </div>

        <div class="auth-right">
            <div class="login-card">
                <h1 class="login-title">Admin Login</h1>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div v-if="success" class="success-message">
                    {{ success }}
                </div>

                <form @submit.prevent="login">
                    <div class="form-group">
                        <input
                            v-model="email"
                            type="email"
                            class="form-input"
                            placeholder="Admin Email"
                            required
                            autofocus
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

                    <button type="submit" class="btn-login" :disabled="loading">
                        {{ loading ? "Logging in..." : "Login" }}
                    </button>
                </form>

                <div class="login-footer">
                    <router-link to="/voter/login" class="login-link"
                        >Login as Student</router-link
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "../../stores/authStore.js";

export default {
    name: "AdminLogin",
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
                await authStore.adminLogin(this.email, this.password);

                this.success = "Login successful! Redirecting...";

                // Redirect to admin dashboard
                setTimeout(() => {
                    this.$router.push("/admin/dashboard");
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
