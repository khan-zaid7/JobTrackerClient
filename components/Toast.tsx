import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }: any) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast align-items-center text-white bg-${type} position-fixed bottom-0 end-0 m-3 show`} role="alert">
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose}></button>
      </div>
    </div>
  );
}