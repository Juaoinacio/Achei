'use client';

import React from 'react';

export type BadgeVariant = 'lost' | 'found' | 'portaria' | 'reward' | 'returned' | 'neutral' | 'blue' | 'yellow';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-extrabold rounded-md tracking-wider uppercase transition-colors';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] sm:text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    lost: 'bg-amber-50 text-amber-800 border border-amber-200',
    found: 'bg-blue-50 text-brand-blue border border-blue-200',
    portaria: 'bg-purple-50 text-purple-700 border border-purple-200',
    reward: 'bg-brand-yellowLight text-amber-900 border border-amber-300',
    returned: 'bg-slate-100 text-slate-700 border border-slate-200',
    neutral: 'bg-slate-50 text-slate-600 border border-brand-gray',
    blue: 'bg-brand-blue text-white',
    yellow: 'bg-brand-yellow text-brand-dark',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <i className={`bx ${icon}`}></i>}
      <span>{children}</span>
    </span>
  );
};
