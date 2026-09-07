import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // StudioView lives outside several product-level modals (for example Team).
  // Tell it to stop handling Phaser keyboard and pointer input while a modal is open.
  useEffect(() => {
    if (!isOpen) return;
    window.dispatchEvent(new CustomEvent<boolean>('studio-ui-input-lock', { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent<boolean>('studio-ui-input-lock', { detail: false }));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      data-studio-modal-open="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        className={cn(
          'relative w-full bg-studio-panel border border-studio-border rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]',
          widthClasses[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-studio-border">
          <div>
            <h3 className="text-lg font-bold text-studio-text tracking-wide">{title}</h3>
            {description && <p className="text-xs text-studio-muted mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-studio-muted hover:text-studio-text p-1 rounded-lg hover:bg-studio-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
