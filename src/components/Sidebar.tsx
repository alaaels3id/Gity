import React, { useMemo } from 'react';
import gityLogo from '../assets/icon.png';
import { 
  Folder, 
  FolderGit2, 
  Server, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  CloudDownload, 
  Settings as SettingsIcon, 
  Plus, 
  Settings2,
  Gamepad2,
  Sparkles,
  Code2,
  Terminal,
  Cpu,
  Award
} from 'lucide-react';
import { FilterCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getTechMeta, TechMeta } from '../utils/projectType';

interface SidebarProps {
  currentCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  folders: string[];
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  onAddFolder: () => void;
  onOpenManageFolders: () => void;
  isManagingFolders: boolean;
  isSettingsOpen?: boolean;
  onOpenSettings: () => void;
  isBadgesOpen?: boolean;
  onOpenBadges: () => void;
  onRefresh?: () => void;
  counts: {
    all: number;
    laravel: number;
    javascript?: number;
    python?: number;
    modified: number;
    behind: number;
    clean: number;
    types?: Record<string, number>;
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
  isSettingsOpen,
  onOpenSettings,
  isBadgesOpen,
  onOpenBadges,
  onRefresh,
  counts,
  folderCounts,
}) => {
  const { t, isRTL } = useLanguage();

  const detectedTypes = useMemo(() => {
    const list: { key: string; label: string; count: number; percent: number; meta: TechMeta }[] = [];
    const total = counts.all || 0;
    const typesMap = counts.types || {};

    const keys = Object.keys(typesMap);
    if (keys.length === 0 && counts.laravel > 0) {
      const p = total > 0 ? Math.round((counts.laravel / total) * 100) : 0;
      list.push({ key: 'laravel', label: 'Laravel', count: counts.laravel, percent: p, meta: getTechMeta('laravel') });
    } else {
      keys.forEach((k) => {
        const c = typesMap[k] || 0;
        if (c > 0) {
          const meta = getTechMeta(k);
          const percent = total > 0 ? Math.round((c / total) * 100) : 0;
          list.push({ key: k, label: meta.label, count: c, percent, meta });
        }
      });
      list.sort((a, b) => b.count - a.count);
    }
    return list;
  }, [counts]);

  const navItems = [
    {
      id: 'all' as FilterCategory,
      label: t('allProjects'),
      icon: GitBranch,
      color: 'text-[#00c8ff]',
      ledClass: 'toy-led-cyan',
      badge: counts.all,
      badgeColor: 'bg-[#00c8ff]/20 text-[#00c8ff] border-[#00c8ff]/40',
      activeColor: 'bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/50 shadow-[0_3px_0_rgba(0,200,255,0.2)]',
    },
    ...(counts.laravel > 0 ? [{
      id: 'laravel' as FilterCategory,
      label: t('laravelProjectsNav'),
      icon: Server,
      color: 'text-[#ff4d79]',
      ledClass: 'toy-led-coral',
      badge: counts.laravel,
      badgeColor: 'bg-[#ff4d79]/20 text-[#ff4d79] border-[#ff4d79]/40',
      activeColor: 'bg-[#ff4d79]/15 text-[#ff4d79] border-[#ff4d79]/50 shadow-[0_3px_0_rgba(255,77,121,0.2)]',
    }] : []),
    ...((counts.javascript || 0) > 0 ? [{
      id: 'javascript' as FilterCategory,
      label: t('javascriptProjects'),
      icon: Code2,
      color: 'text-[#ffc01d]',
      ledClass: 'toy-led-amber',
      badge: counts.javascript || 0,
      badgeColor: 'bg-[#ffc01d]/20 text-[#ffc01d] border-[#ffc01d]/40',
      activeColor: 'bg-[#ffc01d]/15 text-[#ffc01d] border-[#ffc01d]/50 shadow-[0_3px_0_rgba(255,192,29,0.2)]',
    }] : []),
    ...((counts.python || 0) > 0 ? [{
      id: 'python' as FilterCategory,
      label: t('pythonProjects'),
      icon: Terminal,
      color: 'text-[#00e699]',
      ledClass: 'toy-led-green',
      badge: counts.python || 0,
      badgeColor: 'bg-[#00e699]/20 text-[#00e699] border-[#00e699]/40',
      activeColor: 'bg-[#00e699]/15 text-[#00e699] border-[#00e699]/50 shadow-[0_3px_0_rgba(0,230,153,0.2)]',
    }] : []),
    {
      id: 'modified' as FilterCategory,
      label: t('modifiedRepos'),
      icon: AlertCircle,
      color: 'text-[#ffc01d]',
      ledClass: 'toy-led-amber',
      badge: counts.modified,
      badgeColor: 'bg-[#ffc01d]/20 text-[#ffc01d] border-[#ffc01d]/40',
      activeColor: 'bg-[#ffc01d]/15 text-[#ffc01d] border-[#ffc01d]/50 shadow-[0_3px_0_rgba(255,192,29,0.2)]',
    },
    {
      id: 'behind' as FilterCategory,
      label: t('behindRemote'),
      icon: CloudDownload,
      color: 'text-sky-400',
      ledClass: 'toy-led-cyan',
      badge: counts.behind,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/50 shadow-[0_3px_0_rgba(56,189,248,0.2)]',
    },
    {
      id: 'clean' as FilterCategory,
      label: t('cleanRepos'),
      icon: CheckCircle2,
      color: 'text-[#00e699]',
      ledClass: 'toy-led-green',
      badge: counts.clean,
      badgeColor: 'bg-[#00e699]/20 text-[#00e699] border-[#00e699]/40',
      activeColor: 'bg-[#00e699]/15 text-[#00e699] border-[#00e699]/50 shadow-[0_3px_0_rgba(0,230,153,0.2)]',
    },
    {
      id: 'badges' as FilterCategory,
      label: t('badgeCollection'),
      icon: Award,
      color: 'text-[#ffc01d]',
      ledClass: 'toy-led-amber',
      badge: 'ALL',
      badgeColor: 'bg-[#ffc01d]/20 text-[#ffc01d] border-[#ffc01d]/40',
      activeColor: 'bg-[#ffc01d]/15 text-[#ffc01d] border-[#ffc01d]/50 shadow-[0_3px_0_rgba(255,192,29,0.2)]',
    },
  ];

  const laravelPercent = counts.all > 0 ? Math.round((counts.laravel / counts.all) * 100) : 0;

  return (
    <aside className={`w-64 bg-slate-50/90 dark:bg-[#0e131f]/95 backdrop-blur-xl ${isRTL ? 'border-l' : 'border-r'} border-slate-200 dark:border-white/[0.08] flex flex-col justify-between select-none relative z-20 flex-shrink-0 h-full overflow-hidden shadow-sm dark:shadow-2xl`}>
      {/* Top Titlebar Drag Area & Brand */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* macOS traffic lights clearance */}
        <div className="titlebar-drag h-10 w-full flex-shrink-0" />

        <div className="no-drag px-3 pb-3 flex flex-col gap-3.5">
          {/* Studio Brand Header */}
          <div className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#131929] border border-slate-200/90 dark:border-white/[0.08] rounded-xl shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#0a0d14] border border-white/[0.1] flex items-center justify-center shrink-0 p-1 shadow-sm overflow-hidden">
              <img 
                src={gityLogo} 
                alt="Gity" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = './icon.png';
                }}
              />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                  Gity Studio
                </h1>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                Laravel & Git Workspace
              </p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="px-2 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                {t('navigation')}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isBadgesItem = item.id === 'badges';
              const isActive = isBadgesItem ? isBadgesOpen : (!isBadgesOpen && currentCategory === item.id);
              const handleClick = isBadgesItem ? onOpenBadges : () => onSelectCategory(item.id);
              return (
                <button
                  key={item.id}
                  onClick={handleClick}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/10 dark:bg-white/[0.08] text-sky-600 dark:text-white shadow-sm border border-sky-500/20 dark:border-white/[0.1]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md shrink-0 ${
                    isActive 
                      ? 'bg-sky-500/20 dark:bg-white/[0.12] text-sky-600 dark:text-sky-300 font-bold'
                      : 'bg-slate-200/70 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Project Folders Section (Multi-Folder Management) */}
          <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
            <div className="px-2 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                {t('projectFolders')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenManageFolders}
                  title={t('manageFolders')}
                  className={`p-1 rounded-md transition-colors cursor-pointer border ${
                    isManagingFolders 
                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-500/40' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.05] border-transparent'
                  }`}
                >
                  <Settings2 className="w-3 h-3" />
                </button>
                <button
                  onClick={onAddFolder}
                  title={t('addFolder')}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/30 border border-sky-500/30"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>ADD</span>
                </button>
              </div>
            </div>

            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-0.5">
              {/* All Folders option */}
              <button
                onClick={() => onSelectFolder(null)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  selectedFolder === null
                    ? 'bg-sky-500/10 dark:bg-white/[0.08] text-sky-600 dark:text-white font-semibold border border-sky-500/20 dark:border-white/[0.1]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderGit2 className={`w-3.5 h-3.5 shrink-0 ${selectedFolder === null ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{t('allFolders')}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400">
                  {counts.all}
                </span>
              </button>

              {/* Each folder */}
              {folders.map((folderPath) => {
                const folderName = folderPath.split(/[\\/]/).filter(Boolean).pop() || folderPath;
                const isSelected = selectedFolder === folderPath;
                const count = folderCounts[folderPath] || 0;

                return (
                  <button
                    key={folderPath}
                    onClick={() => onSelectFolder(folderPath)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 dark:bg-white/[0.08] text-sky-600 dark:text-white font-semibold border border-sky-500/20 dark:border-white/[0.1]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`}
                    title={folderPath}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate text-xs">{folderName}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tech Gauge & Controls */}
      <div className="no-drag p-3 border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/50 dark:bg-[#0a0d14]/70 space-y-2.5 flex-shrink-0">
        {/* Workspace Tech Stack Power Gauge */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#131929] border border-slate-200/80 dark:border-white/[0.08] space-y-2 shadow-sm">
          {/* Header Row with Total & Badges Collection Button */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold tracking-tight text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>{t('techStack')}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenBadges}
                title={t('badgeCollection')}
                className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isBadgesOpen
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <Award className="w-3 h-3 text-amber-500" />
                <span>BADGES</span>
              </button>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/[0.04] text-sky-600 dark:text-sky-400">
                {counts.all}
              </span>
            </div>
          </div>

          {/* Multi-Segment Stacked Power Bar */}
          <div className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] h-2 p-0.5 rounded-full flex overflow-hidden gap-0.5">
            {detectedTypes.length > 0 ? (
              detectedTypes.map((item) => (
                <div
                  key={item.key}
                  style={{
                    width: `${Math.max(item.percent, 3)}%`,
                    backgroundColor: item.meta.barColor,
                  }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                  title={`${item.label}: ${item.count} (${item.percent}%)`}
                />
              ))
            ) : (
              <div className="w-full h-full bg-slate-200 dark:bg-white/[0.1] rounded-full" />
            )}
          </div>

          {/* Breakdown Badges / Interactive Filters */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {detectedTypes.map((item) => {
              const isActive = currentCategory === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectCategory(isActive ? 'all' : (item.key as FilterCategory))}
                  title={`Filter by ${item.label}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer border transition-all ${
                    isActive
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-700 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200/70 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.meta.ledClass}`} />
                  <span>{item.label}</span>
                  <span className="font-mono text-slate-400 font-bold ml-0.5">{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Full-Width Button */}
        <div>
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              isSettingsOpen
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400'
                : 'bg-white dark:bg-[#131929] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] text-slate-700 dark:text-slate-300'
            }`}
            title={t('settings')}
          >
            <SettingsIcon className={`w-3.5 h-3.5 ${isSettingsOpen ? 'text-sky-500' : 'text-slate-400'}`} />
            <span>{t('settingsTitle')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
