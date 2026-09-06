import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  RotateCw, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight,
  HardDrive, 
  Layers, 
  Server, 
  GitBranch, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ManageFoldersPageProps {
  folders: string[];
  projects: ProjectItem[];
  onBack: () => void;
  onAddFolder: () => void;
  onRemoveFolder: (folder: string) => void;
  onRescan: () => void;
  onOpenLocation: (path: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ManageFoldersPage: React.FC<ManageFoldersPageProps> = ({
  folders,
  projects,
  onBack,
  onAddFolder,
  onRemoveFolder,
  onRescan,
  onOpenLocation,
  onShowToast,
}) => {
  const { t, isRTL } = useLanguage();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    onShowToast?.(t('pathCopied'), 'success');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleTriggerRescan = async () => {
    setIsRescanning(true);
    try {
      await onRescan();
      onShowToast?.('Rescan complete', 'success');
    } finally {
      setIsRescanning(false);
    }
  };

  const getFolderStats = (folderPath: string) => {
    const folderProjects = projects.filter(p => p.rootPath === folderPath || p.path.startsWith(folderPath));
    return {
      total: folderProjects.length,
      laravel: folderProjects.filter(p => p.isLaravel).length,
      git: folderProjects.filter(p => p.isGit).length,
      dirty: folderProjects.filter(p => !p.clean && p.isGit).length,
    };
  };

  const totalLaravel = projects.filter(p => p.isLaravel).length;
  const totalGit = projects.filter(p => p.isGit).length;

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0d111d] text-slate-800 dark:text-slate-100 select-none overflow-hidden">
      {/* Titlebar drag space */}
      <div className="titlebar-drag h-10 w-full flex-shrink-0" />

      {/* Top Navigation Bar */}
      <header className="no-drag bg-white/95 dark:bg-[#131929]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="studio-btn px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer group gap-1.5"
          >
            {isRTL ? (
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-sky-500" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-sky-500" />
            )}
            <span>{t('backToProjects')}</span>
            <kbd className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
              ESC
            </kbd>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {t('manageFolders')}
              </h1>
              <span className="studio-pill bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 text-xs py-0.5 font-semibold">
                {folders.length} {folders.length === 1 ? 'Volume' : 'Volumes'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Monitored project directories & storage volumes
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerRescan}
            disabled={isRescanning}
            className="studio-btn px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5"
            title={t('rescanFolder')}
          >
            <RotateCw className={`w-3.5 h-3.5 text-sky-500 ${isRescanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('rescanFolder')}</span>
          </button>

          <button
            onClick={onAddFolder}
            className="studio-btn-primary px-3.5 py-1.5 text-xs cursor-pointer gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add Volume</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="no-drag flex-1 overflow-y-auto p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="studio-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{folders.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">VOLUMES</div>
            </div>
          </div>

          <div className="studio-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{projects.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">TOTAL REPOS</div>
            </div>
          </div>

          <div className="studio-card p-4 flex items-center gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff2d20] to-transparent opacity-80" />
            <div className="w-10 h-10 rounded-xl bg-[#ff2d20]/10 border border-[#ff2d20]/30 flex items-center justify-center text-[#ff2d20] shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#ff2d20] leading-none">{totalLaravel}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">LARAVEL STACK</div>
            </div>
          </div>

          <div className="studio-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-500 leading-none">{totalGit}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">GIT REPOSITORIES</div>
            </div>
          </div>
        </div>

        {/* Folders List Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Volumes ({folders.length})
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            Auto-scan active
          </span>
        </div>

        {/* Folders Cards List */}
        <div className="space-y-3">
          {folders.map((folderPath, idx) => {
            const folderName = folderPath.split(/[\\/]/).filter(Boolean).pop() || folderPath;
            const stats = getFolderStats(folderPath);

            return (
              <div
                key={idx}
                className="studio-card p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Folder Identity & Path */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {folderName}
                      </h3>
                      <span className="studio-pill bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 text-[11px] py-0.5">
                        {stats.total} {stats.total === 1 ? 'repo' : 'repos'}
                      </span>
                    </div>

                    {/* Path Row with Copy Button */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg" title={folderPath}>
                        {folderPath}
                      </span>
                      <button
                        onClick={() => handleCopy(folderPath)}
                        className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1 cursor-pointer"
                        title={t('copyPath')}
                      >
                        {copiedPath === folderPath ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Stats badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {stats.laravel > 0 && (
                        <span className="studio-pill bg-[#ff2d20]/10 border-[#ff2d20]/30 text-[#ff2d20] text-xs py-0.5 font-semibold">
                          <Server className="w-3 h-3" />
                          <span>{stats.laravel} Laravel</span>
                        </span>
                      )}
                      {stats.git > 0 && (
                        <span className="studio-pill bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs py-0.5 font-medium">
                          <GitBranch className="w-3 h-3" />
                          <span>{stats.git} Git Repos</span>
                        </span>
                      )}
                      {stats.dirty > 0 && (
                        <span className="studio-pill bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs py-0.5 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>{stats.dirty} {t('modifiedBadge')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Open in Finder */}
                  <button
                    onClick={() => onOpenLocation(folderPath)}
                    className="studio-btn px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5"
                    title={t('openInFinder')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t('openInFinder')}</span>
                  </button>

                  {/* Remove Folder Button */}
                  <button
                    onClick={() => onRemoveFolder(folderPath)}
                    disabled={folders.length <= 1}
                    className="studio-btn px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer disabled:opacity-30 disabled:pointer-events-none gap-1.5"
                    title={folders.length <= 1 ? t('atLeastOneFolder') : t('removeFolder')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('removeFolder')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Workspace Hero Card */}
        <div 
          onClick={onAddFolder}
          className="border border-dashed border-slate-300 dark:border-white/[0.15] hover:border-sky-500/60 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2.5 cursor-pointer group bg-white/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04]"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] group-hover:bg-sky-500/10 border border-slate-200 dark:border-white/[0.08] group-hover:border-sky-500/30 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-transform group-hover:scale-105">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
              Attach New Storage Volume
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
              {t('projectsDirHelp')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
