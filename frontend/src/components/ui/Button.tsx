'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'lilac' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: string; // Boxicons class name, ex: "bx-plus"
  rightIcon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-1.5 font-bold rounded-lg transition-all shadow-xs cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-brand-yellow hover:bg-brand-yellowHover text-brand-dark font-extrabold shadow-xs',
    secondary: 'bg-brand-blue hover:bg-brand-blueHover text-white font-bold shadow-xs',
    lilac: 'bg-brand-lilac hover:bg-brand-lilacHover text-white font-bold shadow-xs',
    outline: 'bg-white hover:bg-slate-50 text-brand-dark border border-brand-gray font-bold',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 font-semibold shadow-none',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <i className="bx bx-loader-alt animate-spin text-base"></i>
      ) : (
        leftIcon && <i className={`bx ${leftIcon} text-base`}></i>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <i className={`bx ${rightIcon} text-base`}></i>}
    </button>
  );
};
