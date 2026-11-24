import './toast.scss';
import type { ToastMessage } from './useToast';

function Toast({ toast }: { toast: ToastMessage | null }) {
  if (!toast) return null;

  return (
    <div
      className={`toast toast--${toast.variant}`}
      role={toast.variant === 'success' ? 'status' : 'alert'}
      aria-live={toast.variant === 'success' ? 'polite' : 'assertive'}
    >
      {toast.message}
    </div>
  );
}

export default Toast;
