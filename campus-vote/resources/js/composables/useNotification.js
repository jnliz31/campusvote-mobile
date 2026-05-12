import { reactive, computed } from "vue";

const notificationState = reactive({
    notifications: [],
    nextId: 0,
});

export function useNotification() {
    const notifications = computed(() => notificationState.notifications);

    const show = (message, type = "info", duration = 5000) => {
        const id = notificationState.nextId++;
        const notification = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration,
        };

        notificationState.notifications.push(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }

        return id;
    };

    const remove = (id) => {
        const index = notificationState.notifications.findIndex(
            (n) => n.id === id,
        );
        if (index > -1) {
            notificationState.notifications.splice(index, 1);
        }
    };

    const success = (message, duration = 5000) => {
        return show(message, "success", duration);
    };

    const error = (message, duration = 5000) => {
        return show(message, "error", duration);
    };

    const warning = (message, duration = 5000) => {
        return show(message, "warning", duration);
    };

    const info = (message, duration = 5000) => {
        return show(message, "info", duration);
    };

    return {
        notifications,
        show,
        success,
        error,
        warning,
        info,
        remove,
    };
}
