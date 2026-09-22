import React from 'react';

export interface CarbonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const CarbonButton: React.FC<CarbonButtonProps> = ({
  children,
  kind = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }[size];

  const kindClasses = {
    primary:
      'bg-[#0f62fe] text-white hover:bg-[#0353e9] active:bg-[#002d9c] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-offset-2 border border-transparent',
    secondary:
      'bg-[#393939] text-white hover:bg-[#4c4c4c] active:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#393939] focus:ring-offset-2 border border-transparent dark:bg-[#525252] dark:hover:bg-[#6f6f6f]',
    tertiary:
      'bg-transparent text-[#0f62fe] border border-[#0f62fe] hover:bg-[#0f62fe] hover:text-white active:bg-[#002d9c] focus:outline-none focus:ring-2 focus:ring-[#0f62fe] dark:text-[#78a9ff] dark:border-[#78a9ff] dark:hover:bg-[#0f62fe] dark:hover:text-white',
    danger:
      'bg-[#da1e28] text-white hover:bg-[#ba1b23] active:bg-[#750e13] focus:outline-none focus:ring-2 focus:ring-[#da1e28] border border-transparent',
    ghost:
      'bg-transparent text-[#0f62fe] hover:bg-[#e5e5e5] active:bg-[#c6c6c6] dark:text-[#78a9ff] dark:hover:bg-[#393939] dark:active:bg-[#525252] border border-transparent',
  }[kind];

  return (
    <button
      className={`inline-flex items-center justify-between font-sans font-medium transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${kindClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center gap-2">
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
      {icon && iconPosition === 'right' && <span className="ml-3 shrink-0">{icon}</span>}
    </button>
  );
};
