import { AlertCircle, X } from "lucide-react";

interface AlertProps {
  type?: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'error', message, onClose }) => (
  <div className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
    type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
  }`}>
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <span className="flex-1">{message}</span>
    {onClose && (
      <button onClick={onClose} className="text-current hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);