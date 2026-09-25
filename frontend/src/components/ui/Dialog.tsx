'use client';

import React, { useEffect } from 'react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>
      <div
        className={`relative bg-white border border-brand-gray rounded-2xl w-full ${maxWidthClasses[maxWidth]} shadow-2xl overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-brand-gray flex items-start justify-between bg-slate-50/60">
          <div className="space-y-1">
            {badge && <div className="mb-1">{badge}</div>}
            <h3 className="text-lg font-bold text-brand-dark leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Fechar diálogo"
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-brand-gray bg-slate-50/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
