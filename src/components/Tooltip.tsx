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
      className={`relative inline-flex items-center justify-center max-w-full min-w-0 ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-3 py-1.5 text-xs font-extrabold text-[#00c8ff] bg-[#121728] border-2 border-[#00c8ff] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5),0_2px_0_#006b8f] w-max max-w-xs whitespace-nowrap text-center animate-in fade-in zoom-in-95 duration-100 ${
            position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
          }`}
        >
          {content}
          {/* Toy Speech Bubble Pointer */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent ${
              position === 'top'
                ? 'top-full border-t-4 border-t-[#00c8ff]'
                : 'bottom-full border-b-4 border-b-[#00c8ff]'
            }`}
          />
        </div>
      )}
    </div>
  );
};
