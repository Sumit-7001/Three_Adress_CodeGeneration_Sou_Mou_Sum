import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export default function Toast({ message, type = 'success', onDismiss }) {
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`}>
      <Icon size={16} />
      <span>{message}</span>
      <button className="toast-close" onClick={onDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}
