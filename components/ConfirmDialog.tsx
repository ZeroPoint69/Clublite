
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-bg/95 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-sm:max-w-[300px] max-w-sm overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-border">
        <div className="p-8">
          <div className={`w-14 h-14 rounded-full mb-6 flex items-center justify-center shadow-lg ${variant === 'danger' ? 'bg-red-900/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
            <AlertCircle size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-text mb-3 leading-tight">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3.5 rounded-xl font-bold text-text-secondary bg-bg hover:bg-border active:scale-95 transition-all border border-border"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3.5 rounded-xl font-bold text-bg transition-all shadow-xl active:scale-95 ${
                variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-text-secondary hover:text-text active:scale-90 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
