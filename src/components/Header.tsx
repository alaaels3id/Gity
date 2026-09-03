import React from 'react';
import { 
  Search, 
  RotateCw, 
  CloudDownload, 
  Folder, 
  LayoutGrid, 
  List, 
  Edit2 
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
  onOpenSettings: () => void;
  isBulkFetching: boolean;
  bulkProgress: { current: number; total: number };
  counts: {
    all: number;
    laravel: number;
    modified: number;
    behind: number;
    clean: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  searchQuery,
  onSearchChange,
  activeFilter,
  viewMode,
  onViewModeChange,
  onRefresh,
  onFetchAll,
  onOpenSettings,
  isBulkFetching,
  bulkProgress,
  counts,
}) => {
  const { t, isRTL } = useLanguage();

  const getTitle = () => {
    switch (activeFilter) {
      case 'laravel':
        return { label: t('laravelProjectsNav'), count: counts.laravel, accent: 'text-[#ff2d55]' };
      case 'modified':
        return { label: t('modifiedRepos'), count: counts.modified, accent: 'text-[#ffc000]' };
      case 'behind':
        return { label: t('behindRemote'), count: counts.behind, accent: 'text-sky-400' };
      case 'clean':
        return { label: t('cleanRepos'), count: counts.clean, accent: 'text-[#00e575]' };
      default:
        return { label: t('allProjects'), count: counts.all, accent: 'text-[#00e5ff]' };
    }
  };

  const currentView = getTitle();

  return (
    <header className="bg-[#0d0f15]/95 backdrop-blur-xl border-b border-[#262a38] px-6 pb-3.5 z-20 flex-shrink-0">
      {/* Draggable macOS titlebar region */}
      <div className="titlebar-drag h-10 w-full" />

      {/* Main Toolbar */}
      <div className="no-drag flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Title & Item Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-black text-white tracking-tight">
              {currentView.label}
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#181b26] border border-[#2d3142] text-[#00e5ff] shadow-[1px_1px_0px_0px_#000]">
              {currentView.count}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-[#262a38] mx-1" />

          {/* Directory pill */}
          <button
            onClick={onOpenSettings}
            title={t('changeFolder')}
            className="hidden lg:inline-flex items-center gap-1.5 bg-[#12141c] hover:bg-[#181b26] border border-[#262a38] hover:border-[#00e5ff]/50 px-2.5 py-1 rounded-md text-xs text-slate-300 hover:text-white transition-colors max-w-[280px] brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          >
            <Folder className="w-3 h-3 text-[#00e5ff] flex-shrink-0" />
            <span className="font-mono text-[11px] truncate">{currentPath}</span>
            <Edit2 className="w-2.5 h-2.5 text-slate-400 ml-1 flex-shrink-0" />
          </button>
        </div>

        {/* Right: Search + View Mode + Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-56 sm:w-64">
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={`w-full bg-[#12141c] focus:bg-[#090a0f] border border-[#262a38] focus:border-[#00e5ff] rounded-md py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-[1px_1px_0px_0px_#000] font-mono ${
                isRTL ? 'pr-8 pl-8' : 'pl-8 pr-8'
              }`}
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-[#090a0f] border border-[#262a38] rounded px-1.5 py-0.2 pointer-events-none ${
              isRTL ? 'left-2' : 'right-2'
            }`}>
              ⌘F
            </span>
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center bg-[#12141c] border border-[#262a38] rounded-md p-0.5 shadow-[1px_1px_0px_0px_#000]">
            <button
              onClick={() => onViewModeChange('grid')}
              title={t('gridView')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#181b26] text-[#00e5ff] border border-[#00e5ff]/50 shadow-[1px_1px_0px_0px_#000]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title={t('listView')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#181b26] text-[#00e5ff] border border-[#00e5ff]/50 shadow-[1px_1px_0px_0px_#000]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bulk Fetch */}
          <button
            onClick={onFetchAll}
            disabled={isBulkFetching || counts.all === 0}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-slate-200 transition-all disabled:opacity-40 brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
            title={t('fetchAll')}
          >
            <CloudDownload className={`w-3.5 h-3.5 ${isBulkFetching ? 'animate-bounce text-[#00e5ff]' : 'text-slate-300'}`} />
            <span className="hidden md:inline">
              {isBulkFetching
                ? t('fetchingAllProgress', { current: bulkProgress.current, total: bulkProgress.total })
                : t('fetchAll')}
            </span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            title={t('refresh')}
            className="p-2 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-slate-400 text-slate-200 brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
