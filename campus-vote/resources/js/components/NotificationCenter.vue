<template>
    <div class="notification-container">
        <transition-group name="notification" tag="div">
            <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['notification', `notification-${notification.type}`]"
                role="alert"
            >
                <div class="notification-content">
                    <div class="notification-icon">
                        <svg
                            v-if="notification.type === 'success'"
                            class="icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        <svg
                            v-else-if="notification.type === 'error'"
                            class="icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        <svg
                            v-else-if="notification.type === 'warning'"
                            class="icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        <svg
                            v-else
                            class="icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </div>
                    <div class="notification-text">
                        {{ notification.message }}
                    </div>
                    <button
                        class="notification-close"
                        @click="removeNotification(notification.id)"
                        aria-label="Close notification"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            class="icon"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div
                    v-if="notification.duration > 0"
                    class="notification-progress"
                    :style="{
                        animation: `progress-bar ${notification.duration}ms linear forwards`,
                    }"
                ></div>
            </div>
        </transition-group>
    </div>
</template>

<script>
import { useNotification } from "../composables/useNotification.js";

export default {
    name: "NotificationCenter",
    setup() {
        const { notifications, remove } = useNotification();

        const removeNotification = (id) => {
            remove(id);
        };

        return {
            notifications,
            removeNotification,
        };
    },
};
</script>

<style scoped>
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
}

.notification {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
}

.notification-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
}

.notification-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
}

.icon {
    width: 100%;
    height: 100%;
}

.notification-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
}

.notification-close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.notification-close:hover {
    opacity: 1;
}

.notification-progress {
    height: 3px;
    width: 100%;
}

/* Type-specific styles */
.notification-success {
    background-color: #d1fae5;
    color: #065f46;
}

.notification-success .notification-close {
    color: #065f46;
}

.notification-success .notification-progress {
    background-color: #10b981;
}

.notification-error {
    background-color: #fee2e2;
    color: #7f1d1d;
}

.notification-error .notification-close {
    color: #7f1d1d;
}

.notification-error .notification-progress {
    background-color: #ef4444;
}

.notification-warning {
    background-color: #fef3c7;
    color: #78350f;
}

.notification-warning .notification-close {
    color: #78350f;
}

.notification-warning .notification-progress {
    background-color: #f59e0b;
}

.notification-info {
    background-color: #dbeafe;
    color: #1e3a8a;
}

.notification-info .notification-close {
    color: #1e3a8a;
}

.notification-info .notification-progress {
    background-color: #3b82f6;
}

/* Animations */
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}

.notification-enter-active {
    animation: slideIn 0.3s ease-out;
}

.notification-leave-active {
    animation: slideOut 0.3s ease-in;
}

@keyframes progress-bar {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}
</style>
