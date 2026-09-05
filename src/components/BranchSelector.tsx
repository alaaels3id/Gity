import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, ChevronDown, Check, RefreshCw, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BranchSelectorProps {
  currentBranch: string;
  branches?: string[];
  projectPath: string;
  onCheckout?: (branch: string) => Promise<boolean | void>;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  currentBranch,
  branches = [],
  projectPath,
  onCheckout,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allBranches, setAllBranches] = useState<string[]>(branches);
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetBranch, setTargetBranch] = useState<string | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync branches prop if updated
  useEffect(() => {
    if (branches && branches.length > 0) {
      setAllBranches(branches);
    }
  }, [branches]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchFreshBranches();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const fetchFreshBranches = async () => {
    const api = window.gityAPI || window.api;
    if (api?.getBranches && projectPath) {
      setLoadingBranches(true);
      try {
        const list = await api.getBranches(projectPath);
        if (Array.isArray(list) && list.length > 0) {
          setAllBranches(list);
        }
      } catch {
        // Fallback to existing
      } finally {
        setLoadingBranches(false);
      }
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isSwitching) return;
    setIsOpen(prev => !prev);
    setSearchQuery('');
  };

  const handleSelectBranch = async (e: React.MouseEvent, branch: string) => {
    e.stopPropagation();
    if (branch === currentBranch || isSwitching) {
      setIsOpen(false);
      return;
    }

    if (!onCheckout) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setTargetBranch(branch);
    try {
      await onCheckout(branch);
    } finally {
      setIsSwitching(false);
      setTargetBranch(null);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Filtered branches
  const filteredBranches = allBranches.filter(b =>
    b.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isSwitching}
        title={`${t('switchBranch')}: ${currentBranch}`}
        className={`group flex items-center justify-between gap-1.5 rounded-lg border transition-all duration-150 select-none cursor-pointer ${
          isOpen
            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500/50 text-sky-600 dark:text-sky-300 shadow-sm'
            : 'bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-sm'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
          isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } max-w-full`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {isSwitching ? (
            <RefreshCw className="w-3 h-3 text-sky-500 animate-spin shrink-0" />
          ) : (
            <GitBranch className="w-3 h-3 text-sky-500 shrink-0" />
          )}
          <span className="font-mono font-semibold truncate text-slate-800 dark:text-slate-200">
            {isSwitching && targetBranch ? targetBranch : currentBranch || t('noGit')}
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute mt-1.5 min-w-[210px] max-w-[280px] w-max bg-white/95 dark:bg-[#131929]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl p-2 flex flex-col gap-1.5 animate-in fade-in-0 zoom-in-95 duration-100 z-50 ${
            isRTL ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3 h-3 text-sky-500" />
              <span>{t('localBranches')}</span>
            </span>

            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.06] text-sky-600 dark:text-sky-400">
              {allBranches.length}
            </span>
          </div>

          {/* Search Input (if branches >= 4) */}
          {allBranches.length >= 4 && (
            <div className="relative px-1 pt-0.5">
              <Search
                className={`w-3 h-3 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchBranches')}
                className={`w-full bg-slate-50 dark:bg-[#0a0d14] border border-slate-200 dark:border-white/[0.08] focus:border-sky-500/50 rounded-lg py-1 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono outline-none ${
                  isRTL ? 'pr-7 pl-2' : 'pl-7 pr-2'
                }`}
              />
            </div>
          )}

          {/* Branches List */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04] rounded-lg p-0.5 select-none">
            {loadingBranches && allBranches.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-sky-500" />
                <span>Loading...</span>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                {t('noBranchesFound')}
              </div>
            ) : (
              filteredBranches.map((bName) => {
                const isCurrent = bName === currentBranch;
                const isTarget = isSwitching && targetBranch === bName;

                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={(e) => handleSelectBranch(e, bName)}
                    disabled={isSwitching}
                    className={`w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between gap-2 text-xs font-mono transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <GitBranch
                        className={`w-3 h-3 shrink-0 ${
                          isCurrent ? 'text-sky-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate" title={bName}>
                        {bName}
                      </span>
                    </div>

                    {isTarget ? (
                      <RefreshCw className="w-3 h-3 text-sky-500 animate-spin shrink-0" />
                    ) : isCurrent ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
