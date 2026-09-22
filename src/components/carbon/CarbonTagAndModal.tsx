import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// ==========================================
// Carbon Tag Component
// ==========================================
export interface CarbonTagProps {
  type?: 'blue' | 'gray' | 'green' | 'red' | 'teal' | 'purple' | 'warm-gray';
  size?: 'sm' | 'md';
  title?: string;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CarbonTag: React.FC<CarbonTagProps> = ({
  type = 'blue',
  size = 'md',
  title,
  onRemove,
  children,
  className = '',
}) => {
  const typeClasses = {
    blue: 'bg-[#edf5ff] text-[#0043ce] dark:bg-[#002d9c] dark:text-[#d0e2ff]',
    gray: 'bg-[#e0e0e0] text-[#393939] dark:bg-[#393939] dark:text-[#c6c6c6]',
    green: 'bg-[#defbe6] text-[#0e6027] dark:bg-[#044317] dark:text-[#a7f0ba]',
    red: 'bg-[#fff1f1] text-[#a2191f] dark:bg-[#750e13] dark:text-[#ffb3b8]',
    teal: 'bg-[#d9fbfb] text-[#005d5d] dark:bg-[#004144] dark:text-[#9ef0f0]',
    purple: 'bg-[#f6f2ff] text-[#6929c4] dark:bg-[#491d8b] dark:text-[#d4bbff]',
    'warm-gray': 'bg-[#e5e0df] text-[#3c3838] dark:bg-[#3c3838] dark:text-[#e5e0df]',
  }[type];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full max-w-full truncate ${typeClasses} ${sizeClasses} ${className}`}
      title={title}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-75 focus:outline-none p-0.5 rounded-full"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// ==========================================
// Carbon Modal Component
// ==========================================
export interface CarbonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryButtonDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CarbonModal: React.FC<CarbonModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonDisabled = false,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-fadeIn">
      <div
        className={`w-full ${sizeClass} bg-[#ffffff] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e0e0e0] dark:border-[#393939] flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-[#161616] dark:text-[#f4f4f4]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[#525252] dark:text-[#c6c6c6]">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#525252] dark:text-[#c6c6c6] hover:bg-[#e0e0e0] dark:hover:bg-[#393939] transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-[#161616] dark:text-[#f4f4f4]">
          {children}
        </div>

        {/* Footer */}
        {(primaryButtonText || secondaryButtonText) && (
          <div className="p-4 bg-[#f4f4f4] dark:bg-[#161616] border-t border-[#e0e0e0] dark:border-[#393939] flex items-center justify-end gap-3">
            {secondaryButtonText && (
              <button
                type="button"
                onClick={onSecondaryClick || onClose}
                className="h-10 px-4 text-sm font-medium bg-[#393939] text-white hover:bg-[#4c4c4c] dark:bg-[#525252] dark:hover:bg-[#6f6f6f] transition-colors cursor-pointer"
              >
                {secondaryButtonText}
              </button>
            )}
            {primaryButtonText && (
              <button
                type="button"
                disabled={primaryButtonDisabled}
                onClick={onPrimaryClick}
                className="h-10 px-5 text-sm font-medium bg-[#0f62fe] text-white hover:bg-[#0353e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {primaryButtonText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
