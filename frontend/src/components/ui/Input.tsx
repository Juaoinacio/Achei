'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-brand-dark">
            {label}
            {props.required && <span className="text-brand-blue ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <i className={`bx ${leftIcon} absolute left-3.5 text-slate-400 text-base pointer-events-none`}></i>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-brand-dark placeholder-slate-400 transition-all outline-none ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightElement ? 'pr-12' : 'pr-3.5'} ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/30'
                : 'border-brand-gray focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-xs text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
