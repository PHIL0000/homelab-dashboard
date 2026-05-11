
import { toast } from "@heroui/react";


// Inline type for toast options (matches HeroUIToastOptions)
type ToastOptions = {
  description?: React.ReactNode;
  indicator?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  actionProps?: any;
  isLoading?: boolean;
  timeout?: number;
  onClose?: () => void;
};

const baseOptions: ToastOptions = {
  timeout: 4000,
};

export function showSuccess(message: string, options?: ToastOptions) {
  toast.success(message, { ...baseOptions, ...options });
}

export function showError(message: string, options?: ToastOptions) {
  toast.danger(message, { ...baseOptions, ...options });
}

export function showInfo(message: string, options?: ToastOptions) {
  toast.info(message, { ...baseOptions, ...options });
}

export const toastPresets = {
  success: showSuccess,
  error: showError,
  info: showInfo,
};
