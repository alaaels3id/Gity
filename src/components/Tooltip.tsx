import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative ${className.includes('w-full') ? 'flex w-full' : 'inline-flex shrink-0'} items-center justify-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium text-slate-100 bg-slate-900/95 dark:bg-[#151c2e]/95 border border-slate-700/60 dark:border-white/10 rounded-lg shadow-xl backdrop-blur-sm w-max max-w-xs whitespace-nowrap text-center animate-in fade-in zoom-in-95 duration-100 ${
            position === 'top'
              ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
              : 'top-full mt-1.5 left-1/2 -translate-x-1/2'
          }`}
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent ${
              position === 'top'
                ? 'top-full border-t-4 border-t-slate-900 dark:border-t-[#151c2e]'
                : 'bottom-full border-b-4 border-b-slate-900 dark:border-b-[#151c2e]'
            }`}
          />
        </div>
      )}
    </div>
  );
};
