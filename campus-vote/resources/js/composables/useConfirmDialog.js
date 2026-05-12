import { reactive, computed } from "vue";

const dialogState = reactive({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDangerous: false,
    resolveCallback: null,
});

export function useConfirmDialog() {
    const isOpen = computed(() => dialogState.isOpen);
    const dialogs = computed(() => dialogState);

    const confirm = (message, options = {}) => {
        return new Promise((resolve) => {
            dialogState.title = options.title || "Confirm Action";
            dialogState.message = message;
            dialogState.confirmText = options.confirmText || "Confirm";
            dialogState.cancelText = options.cancelText || "Cancel";
            dialogState.isDangerous = options.isDangerous || false;
            dialogState.resolveCallback = resolve;
            dialogState.isOpen = true;
        });
    };

    const confirmDangerous = (message, options = {}) => {
        return confirm(message, {
            ...options,
            isDangerous: true,
        });
    };

    const handleConfirm = () => {
        const callback = dialogState.resolveCallback;
        dialogState.isOpen = false;
        dialogState.resolveCallback = null;
        if (callback) callback(true);
    };

    const handleCancel = () => {
        const callback = dialogState.resolveCallback;
        dialogState.isOpen = false;
        dialogState.resolveCallback = null;
        if (callback) callback(false);
    };

    return {
        isOpen,
        dialogs,
        confirm,
        confirmDangerous,
        handleConfirm,
        handleCancel,
    };
}
