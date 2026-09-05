import React from 'react';
import { 
  Search, 
  RotateCw, 
  CloudDownload, 
  Download,
  Folder, 
  LayoutGrid, 
  List, 
  Edit2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { FilterCategory, ViewMode } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentPath: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  onFetchAll: () => void;
  onPullAll?: () => void;
  onOpenSettings: () => void;
  isBulkFetching: boolean;
  bulkProgress: { current: number; total: number };
  isBulkPulling?: boolean;
  bulkPullProgress?: { current: number; total: number };
  counts: {
    all: number;
    laravel: number;
    modified: number;
    behind: number;
    clean: number;
  };
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onFetchAll,
  onPullAll,
  onOpenSettings,
  isBulkFetching,
  bulkProgress,
  isBulkPulling = false,
  bulkPullProgress = { current: 0, total: 0 },
  counts,
  currentTheme = 'dark',
  onToggleTheme,
}) => {
  const { t, isRTL } = useLanguage();

  const getTitle = () => {
    switch (activeFilter) {
      case 'laravel':
        return { 
          label: t('laravelProjectsNav'), 
          count: counts.laravel, 
          led: 'toy-led-coral',
          badgeClass: 'bg-[#ff4d79]/20 text-[#ff4d79] border-[#ff4d79]/40'
        };
      case 'modified':
        return { 
          label: t('modifiedRepos'), 
          count: counts.modified, 
          led: 'toy-led-amber',
          badgeClass: 'bg-[#ffc01d]/20 text-[#d99b00] dark:text-[#ffc01d] border-[#ffc01d]/40'
        };
      case 'behind':
        return { 
          label: t('behindRemote'), 
          count: counts.behind, 
          led: 'toy-led-cyan',
          badgeClass: 'bg-[#00c8ff]/20 text-[#0099dd] dark:text-[#00c8ff] border-[#00c8ff]/40'
        };
      case 'clean':
        return { 
          label: t('cleanRepos'), 
          count: counts.clean, 
          led: 'toy-led-green',
          badgeClass: 'bg-[#00e699]/20 text-[#00b377] dark:text-[#00e699] border-[#00e699]/40'
        };
      default:
        return { 
          label: t('allProjects'), 
          count: counts.all, 
          led: 'toy-led-cyan',
          badgeClass: 'bg-[#00c8ff]/20 text-[#0099dd] dark:text-[#00c8ff] border-[#00c8ff]/40'
        };
    }
  };

  const currentView = getTitle();

  return (
    <header className="bg-white/80 dark:bg-[#0e131f]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] px-6 pb-3.5 z-20 flex-shrink-0 shadow-sm">
      {/* Draggable macOS titlebar region */}
      <div className="titlebar-drag h-10 w-full" />

      {/* Main Studio Toolbar */}
      <div className="no-drag flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Channel & Count Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${currentView.led} shrink-0`} />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{currentView.label}</span>
            </h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
              {currentView.count}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

          {/* Directory Pill with refined touch */}
          <button
            onClick={onOpenSettings}
            title={t('changeFolder')}
            className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-white/[0.03] hover:bg-slate-200/60 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] rounded-lg max-w-[280px] cursor-pointer transition-all"
          >
            <Folder className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span className="text-xs font-medium font-mono truncate">{currentPath}</span>
            <Edit2 className="w-2.5 h-2.5 text-slate-400 ml-0.5 flex-shrink-0" />
          </button>
        </div>

        {/* Right: Studio Search + Switcher + Theme Toggle + Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Command Search Box */}
          <div className="relative w-52 sm:w-60">
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`${t('searchPlaceholder')}...`}
              className={`w-full bg-slate-100/80 dark:bg-white/[0.04] focus:bg-white dark:focus:bg-[#131929] border border-slate-200 dark:border-white/[0.08] focus:border-sky-500/50 dark:focus:border-sky-500/50 rounded-lg py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-sm ${
                isRTL ? 'pr-8 pl-12' : 'pl-8 pr-12'
              }`}
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-white/[0.06] rounded px-1.5 py-0.5 pointer-events-none ${
              isRTL ? 'left-2' : 'right-2'
            }`}>
              ⌘F
            </span>
          </div>

          {/* macOS Segmented Switcher: Grid vs List */}
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => onViewModeChange('grid')}
              title={t('gridView')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title={t('listView')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle Button (Dark / Light Mode) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
            >
              {currentTheme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>
          )}

          {/* Quick Bulk Fetch Trigger */}
          <button
            onClick={onFetchAll}
            disabled={isBulkFetching || isBulkPulling || counts.all === 0}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isBulkFetching
                ? 'bg-sky-500/20 border-sky-500 text-sky-600 dark:text-sky-300'
                : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] hover:border-sky-500/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 shadow-sm'
            }`}
            title={t('fetchAll')}
          >
            <CloudDownload className={`w-3.5 h-3.5 ${isBulkFetching ? 'animate-bounce text-sky-500' : 'text-sky-500'}`} />
            <span className="hidden md:inline">
              {isBulkFetching
                ? t('fetchingAllProgress', { current: bulkProgress.current, total: bulkProgress.total })
                : t('fetchAll')}
            </span>
          </button>

          {/* Quick Bulk Pull Trigger */}
          {onPullAll && (
            <button
              onClick={onPullAll}
              disabled={isBulkPulling || isBulkFetching || counts.all === 0}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isBulkPulling
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm'
              }`}
              title={t('pullAll')}
            >
              <Download className={`w-3.5 h-3.5 ${isBulkPulling ? 'animate-bounce text-emerald-500' : 'text-emerald-500'}`} />
              <span className="hidden md:inline">
                {isBulkPulling
                  ? t('pullingAllProgress', { current: bulkPullProgress.current, total: bulkPullProgress.total })
                  : t('pullAll')}
              </span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title={t('refresh')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
