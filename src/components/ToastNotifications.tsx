import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastNotification } from '../types/viewer';

interface ToastNotificationsProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toasts-container" id="toast-notifications-container">
      {toasts.map((toast) => {
        let Icon = AlertCircle;
        if (toast.type === 'success') Icon = CheckCircle;
        if (toast.type === 'warning') Icon = AlertTriangle;
        if (toast.type === 'info') Icon = Info;

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <Icon
              size={18}
              color={
                toast.type === 'error'
                  ? '#FF4D4D'
                  : toast.type === 'success'
                  ? '#00E58B'
                  : toast.type === 'warning'
                  ? '#FFB020'
                  : '#00BFFF'
              }
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <div className="toast-body">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss alert"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
