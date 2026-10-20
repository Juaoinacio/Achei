'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'error',
  duration = 2000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`fixed top-5 right-5 z-[70] max-w-sm sm:max-w-md w-auto overflow-hidden rounded-2xl shadow-2xl border ${
        isExiting
          ? 'animate-toast-out pointer-events-none'
          : 'animate-toast-in'
      } ${
        isError
          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500/80 shadow-red-950/20'
          : isSuccess
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/80 shadow-emerald-950/20'
          : 'bg-gradient-to-r from-brand-blue to-blue-700 text-white border-blue-400/80 shadow-blue-950/20'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <i
            className={`bx ${
              isError
                ? 'bx-error-circle text-white'
                : isSuccess
                ? 'bx-check-circle text-brand-yellow'
                : 'bx-info-circle text-white'
            } text-xl`}
          ></i>
        </div>

        <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug pr-1">
          {message}
        </span>

        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors cursor-pointer shrink-0"
          aria-label="Fechar notificação"
        >
          <i className="bx bx-x text-xl"></i>
        </button>
      </div>

      {/* Barra de Progresso / Timer no fundo da mensagem */}
      <div className="w-full bg-black/20 h-1 overflow-hidden">
        <div
          className="h-full bg-white/80 animate-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};
