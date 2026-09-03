import React from 'react';
import { 
  Folder, 
  FolderGit2, 
  Server, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  CloudDownload, 
  Settings as SettingsIcon, 
  RotateCw, 
  Languages,
  Plus,
  Settings2
} from 'lucide-react';
import { FilterCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  currentCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  folders: string[];
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  onAddFolder: () => void;
  onOpenManageFolders: () => void;
  isManagingFolders?: boolean;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onFetchAll: () => void;
  isBulkFetching: boolean;
  bulkProgress: { current: number; total: number };
  counts: {
    all: number;
    laravel: number;
    modified: number;
    behind: number;
    clean: number;
  };
  folderCounts: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  folders,
  selectedFolder,
  onSelectFolder,
  onAddFolder,
  onOpenManageFolders,
  isManagingFolders,
  onOpenSettings,
  onRefresh,
  onFetchAll,
  isBulkFetching,
  bulkProgress,
  counts,
  folderCounts,
}) => {
  const { t, language, toggleLanguage, isRTL } = useLanguage();

  const navItems = [
    {
      id: 'all' as FilterCategory,
      label: t('allProjects'),
      icon: GitBranch,
      color: 'text-[#00e5ff]',
      badge: counts.all,
      badgeColor: 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30',
    },
    {
      id: 'laravel' as FilterCategory,
      label: t('laravelProjectsNav'),
      icon: Server,
      color: 'text-[#ff2d55]',
      badge: counts.laravel,
      badgeColor: 'bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/30',
    },
    {
      id: 'modified' as FilterCategory,
      label: t('modifiedRepos'),
      icon: AlertCircle,
      color: 'text-[#ffc000]',
      badge: counts.modified,
      badgeColor: 'bg-[#ffc000]/10 text-[#ffc000] border border-[#ffc000]/30',
    },
    {
      id: 'behind' as FilterCategory,
      label: t('behindRemote'),
      icon: CloudDownload,
      color: 'text-sky-400',
      badge: counts.behind,
      badgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    },
    {
      id: 'clean' as FilterCategory,
      label: t('cleanRepos'),
      icon: CheckCircle2,
      color: 'text-[#00e575]',
      badge: counts.clean,
      badgeColor: 'bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30',
    },
  ];

  const laravelPercent = counts.all > 0 ? Math.round((counts.laravel / counts.all) * 100) : 0;

  return (
    <aside className={`w-64 bg-[#0d0f15] ${isRTL ? 'border-l' : 'border-r'} border-[#262a38] flex flex-col justify-between select-none relative z-20 flex-shrink-0 h-full overflow-hidden`}>
      {/* Top Titlebar Drag Area & Brand */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* macOS traffic lights clearance */}
        <div className="titlebar-drag h-10 w-full flex-shrink-0" />

        <div className="no-drag px-3.5 pb-4 flex flex-col gap-4">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#00e5ff] shadow-[2px_2px_0px_0px_#000] shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base tracking-tight text-white leading-none">
                  {t('appTitle')}
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#181b26] text-[#00e5ff] font-mono font-bold border border-[#2d3142]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-1">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="px-2 py-1">
              <span className="text-xs font-semibold text-slate-400">
                {t('navigation')}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#181b26] text-[#00e5ff] border border-[#00e5ff]/50 shadow-[2px_2px_0px_0px_#000]'
                      : 'text-slate-300 hover:bg-[#151822] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#00e5ff]' : item.color
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Project Folders Section (Multi-Folder Management) */}
          <div className="space-y-1.5 pt-2 border-t border-[#262a38]">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-slate-400">
                {t('projectFolders')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenManageFolders}
                  title={t('manageFolders')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
                    isManagingFolders 
                      ? 'text-[#00e5ff] bg-[#181b26] border-[#00e5ff]/50 shadow-[1px_1px_0px_0px_#000]' 
                      : 'text-slate-400 hover:text-white hover:bg-[#181b26] border-transparent'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onAddFolder}
                  title={t('addFolder')}
                  className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-[#00e5ff] hover:text-white transition-colors cursor-pointer px-1.5 py-1 rounded bg-[#181b26] border border-[#2d3142]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addFolder')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
              {/* All Folders option */}
              <button
                onClick={() => onSelectFolder(null)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all group cursor-pointer ${
                  selectedFolder === null
                    ? 'bg-[#181b26] text-[#00e5ff] border border-[#00e5ff]/40 shadow-[1px_1px_0px_0px_#000]'
                    : 'text-slate-400 hover:bg-[#151822] hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderGit2 className={`w-3.5 h-3.5 shrink-0 ${selectedFolder === null ? 'text-[#00e5ff]' : 'text-slate-500'}`} />
                  <span className="truncate">{t('allFolders')}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#090a0f] border border-[#262a38] text-slate-300">
                  {counts.all}
                </span>
              </button>

              {/* Each folder */}
              {folders.map((folderPath) => {
                const folderName = folderPath.split('/').filter(Boolean).pop() || folderPath;
                const isSelected = selectedFolder === folderPath;
                const count = folderCounts[folderPath] || 0;

                return (
                  <button
                    key={folderPath}
                    onClick={() => onSelectFolder(folderPath)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-[#181b26] text-[#00e5ff] border border-[#00e5ff]/40 shadow-[1px_1px_0px_0px_#000]'
                        : 'text-slate-400 hover:bg-[#151822] hover:text-slate-200 border border-transparent'
                    }`}
                    title={folderPath}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00e5ff]' : 'text-slate-500'}`} />
                      <span className="truncate font-mono text-[11px]">{folderName}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#090a0f] border border-[#262a38] text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Bulk Fetch Button */}
          <div className="pt-1">
            <button
              onClick={onFetchAll}
              disabled={isBulkFetching || counts.all === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-slate-200 hover:text-white brutal-press shadow-[2px_2px_0px_0px_#000] disabled:opacity-40 cursor-pointer"
            >
              <CloudDownload className={`w-3.5 h-3.5 ${isBulkFetching ? 'animate-bounce text-[#00e5ff]' : 'text-slate-300'}`} />
              <span className="truncate">
                {isBulkFetching
                  ? t('fetchingAllProgress', { current: bulkProgress.current, total: bulkProgress.total })
                  : t('fetchAll')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hardware / Stats Gauge & Controls */}
      <div className="no-drag p-3.5 border-t border-[#262a38] bg-[#090a0f] space-y-3 flex-shrink-0">
        {/* Workspace Ratio Quick Gauge */}
        <div className="p-2.5 rounded-md bg-[#12141c] border border-[#262a38] space-y-2 shadow-[1px_1px_0px_0px_#000]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Server className="w-3.5 h-3.5 text-[#ff2d55] shrink-0" />
              <span>{t('laravel')}</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{laravelPercent}%</span>
          </div>
          <div className="w-full bg-[#090a0f] border border-[#262a38] h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#ff2d55] to-[#00e5ff] h-full transition-all duration-500" 
              style={{ width: `${laravelPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
            <span>{counts.laravel} {t('laravel')}</span>
            <span>{counts.all} {t('all')}</span>
          </div>
        </div>

        {/* Action Controls Row (Settings, Language Toggle, Refresh) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSettings}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-slate-400/50 text-slate-200 hover:text-white brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
            title={t('settings')}
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{t('settingsTitle')}</span>
          </button>

          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] text-slate-200 hover:text-[#00e5ff] brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer flex items-center gap-1"
            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] text-slate-200 hover:text-white brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
            title={t('refresh')}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
