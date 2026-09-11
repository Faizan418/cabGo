import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary:
      'bg-cabgo-500 hover:bg-cabgo-600 text-slate-950 shadow-md shadow-cabgo-500/20 focus:ring-cabgo-500 rounded-xl',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-md focus:ring-slate-800 rounded-xl',
    outline:
      'border-2 border-slate-200 hover:border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400 rounded-xl',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500 rounded-xl',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300 rounded-xl',
    dark:
      'bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-400/20 shadow-lg rounded-xl',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
    xl: 'text-lg px-8 py-4 gap-3',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
