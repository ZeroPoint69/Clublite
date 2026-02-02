
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-sm:max-w-[280px] max-w-sm overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
            <AlertCircle size={28} />
          </div>
          
          <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-text-secondary bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
                variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 active:scale-90 p-1.5 rounded-full transition-all"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
