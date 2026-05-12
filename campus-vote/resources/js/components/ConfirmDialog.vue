<template>
    <transition name="overlay" v-if="isOpen">
        <div class="confirm-overlay" @click.self="handleCancel">
            <div class="confirm-dialog">
                <div class="confirm-header">
                    <h2 class="confirm-title">{{ dialogs.title }}</h2>
                    <button
                        class="confirm-close"
                        @click="handleCancel"
                        aria-label="Close dialog"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>

                <div class="confirm-content">
                    {{ dialogs.message }}
                </div>

                <div class="confirm-actions">
                    <button class="btn btn-secondary" @click="handleCancel">
                        {{ dialogs.cancelText }}
                    </button>
                    <button
                        :class="[
                            'btn',
                            dialogs.isDangerous ? 'btn-danger' : 'btn-primary',
                        ]"
                        @click="handleConfirm"
                    >
                        {{ dialogs.confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { useConfirmDialog } from "../composables/useConfirmDialog.js";

export default {
    name: "ConfirmDialog",
    setup() {
        const { isOpen, dialogs, handleConfirm, handleCancel } =
            useConfirmDialog();

        return {
            isOpen,
            dialogs,
            handleConfirm,
            handleCancel,
        };
    },
};
</script>

<style scoped>
.confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    animation: fadeIn 0.2s ease-out;
}

.confirm-dialog {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    animation: slideUp 0.3s ease-out;
}

.confirm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.confirm-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
}

.confirm-close {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.confirm-close:hover {
    color: #111827;
}

.confirm-close svg {
    width: 20px;
    height: 20px;
}

.confirm-content {
    padding: 16px 24px;
    color: #374151;
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
}

.confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 24px 24px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background-color: #116b27;
    color: white;
}

.btn-primary:hover {
    background-color: #0d5620;
}

.btn-primary:active {
    transform: scale(0.98);
}

.btn-danger {
    background-color: #dc2626;
    color: white;
}

.btn-danger:hover {
    background-color: #b91c1c;
}

.btn-danger:active {
    transform: scale(0.98);
}

.btn-secondary {
    background-color: #e5e7eb;
    color: #374151;
}

.btn-secondary:hover {
    background-color: #d1d5db;
}

.btn-secondary:active {
    transform: scale(0.98);
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}
</style>
