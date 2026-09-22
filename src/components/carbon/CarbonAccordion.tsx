import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CarbonAccordionItemProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const CarbonAccordionItem: React.FC<CarbonAccordionItemProps> = ({
  id,
  title,
  subtitle,
  badge,
  defaultOpen = false,
  headerAction,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="border-b border-[#e0e0e0] dark:border-[#393939] bg-[#ffffff] dark:bg-[#262626] transition-colors"
    >
      <div className="flex items-center justify-between p-4 hover:bg-[#f4f4f4] dark:hover:bg-[#333333] transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between text-left focus:outline-none"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-base text-[#161616] dark:text-[#f4f4f4] tracking-tight">
              {title}
            </span>
            {badge !== undefined && (
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-[#e0e0e0] dark:bg-[#393939] text-[#161616] dark:text-[#f4f4f4] rounded-sm">
                {badge}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-[#6f6f6f] dark:text-[#a8a8a8] hidden sm:inline">
                {subtitle}
              </span>
            )}
          </div>
          <div className="text-[#525252] dark:text-[#c6c6c6] mr-2">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#f4f4f4] dark:border-[#333333]">
          {children}
        </div>
      )}
    </div>
  );
};
