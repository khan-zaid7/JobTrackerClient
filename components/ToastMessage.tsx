import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

export default function ToastMessage({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0 show position-fixed bottom-0 end-0 m-3`}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}
