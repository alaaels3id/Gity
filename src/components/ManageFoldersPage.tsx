import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Copy, 
  Check, 
  ExternalLink, 
  RotateCw, 
  Server, 
  GitBranch, 
  Layers, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ManageFoldersPageProps {
  folders: string[];
  projects: ProjectItem[];
  onBack: () => void;
  onAddFolder: () => Promise<void>;
  onRemoveFolder: (folderPath: string) => Promise<void>;
  onRescan: () => Promise<void>;
  onOpenLocation: (folderPath: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
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

  const handleCopy = (pathStr: string) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedPath(pathStr);
    onShowToast(t('pathCopied'), 'success');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleTriggerRescan = async () => {
    setIsRescanning(true);
    try {
      await onRescan();
      onShowToast('Rescanned all workspace folders', 'success');
    } finally {
      setIsRescanning(false);
    }
  };

  // Compute folder-specific metrics
  const getFolderStats = (folderPath: string) => {
    const folderProjects = projects.filter(p => p.rootPath === folderPath);
    return {
      total: folderProjects.length,
      laravel: folderProjects.filter(p => p.isLaravel).length,
      git: folderProjects.filter(p => p.isGit).length,
      dirty: folderProjects.filter(p => p.isGit && !p.clean).length,
    };
  };

  const totalLaravel = projects.filter(p => p.isLaravel).length;
  const totalGit = projects.filter(p => p.isGit).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] text-slate-100 overflow-hidden select-none">
      {/* Top Titlebar Drag Area */}
      <div className="titlebar-drag h-10 w-full flex-shrink-0" />

      {/* Top Navigation Bar */}
      <header className="no-drag bg-[#0d0f15]/95 backdrop-blur-xl border-b border-[#262a38] px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer group"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-[#00e5ff]" />
            ) : (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#00e5ff]" />
            )}
            <span>{t('backToProjects')}</span>
            <span className="text-[10px] text-slate-400 font-mono">Esc</span>
          </button>

          <div className="h-4 w-[1px] bg-[#262a38]" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">
                {t('manageFolders')}
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#181b26] text-[#00e5ff] border border-[#2d3142] shadow-[1px_1px_0px_0px_#000]">
                {folders.length} {t('monitoredFolders')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {t('manageFoldersSubtitle')}
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerRescan}
            disabled={isRescanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-slate-400 text-slate-200 transition-all cursor-pointer disabled:opacity-50 brutal-press shadow-[1px_1px_0px_0px_#000]"
            title={t('rescanFolder')}
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#00e5ff] ${isRescanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('rescanFolder')}</span>
          </button>

          <button
            onClick={onAddFolder}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold bg-[#00e5ff] hover:bg-[#33ebff] text-black transition-all shadow-[2px_2px_0px_0px_#ffffff] brutal-press cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-black" />
            <span>{t('addFolder')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="no-drag flex-1 overflow-y-auto p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#12141c] border border-[#262a38] rounded-md p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-10 h-10 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#00e5ff] shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-white leading-none">{folders.length}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">{t('monitoredFolders')}</div>
            </div>
          </div>

          <div className="bg-[#12141c] border border-[#262a38] rounded-md p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-10 h-10 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#00e5ff] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-white leading-none">{projects.length}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">{t('totalProjects')}</div>
            </div>
          </div>

          <div className="bg-[#12141c] border border-[#262a38] rounded-md p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-10 h-10 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#ff2d55] shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#ff2d55] leading-none">{totalLaravel}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">{t('laravelProjects')}</div>
            </div>
          </div>

          <div className="bg-[#12141c] border border-[#262a38] rounded-md p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-10 h-10 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#00e575] shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#00e575] leading-none">{totalGit}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">{t('gitRepos')}</div>
            </div>
          </div>
        </div>

        {/* Folders List Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            {t('projectFolders')} [{folders.length}]
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {t('projectsDirHelp')}
          </span>
        </div>

        {/* Folders Cards List */}
        <div className="space-y-3.5">
          {folders.map((folderPath, idx) => {
            const folderName = folderPath.split('/').filter(Boolean).pop() || folderPath;
            const stats = getFolderStats(folderPath);

            return (
              <div
                key={idx}
                className="bg-[#12141c] hover:bg-[#161a24] border border-[#262a38] hover:border-[#3d4358] rounded-md p-5 shadow-[2px_2px_0px_0px_#000] transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Folder Identity & Path */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-md bg-[#181b26] border border-[#2d3142] flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[1px_1px_0px_0px_#000]">
                    <Folder className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-black text-white tracking-tight truncate">
                        {folderName}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-[#090a0f] border border-[#262a38] text-slate-300">
                        {stats.total} {t('all')}
                      </span>
                    </div>

                    {/* Path Row with Copy Button */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-slate-400 truncate max-w-lg" title={folderPath}>
                        {folderPath}
                      </span>
                      <button
                        onClick={() => handleCopy(folderPath)}
                        className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                        title={t('copyPath')}
                      >
                        {copiedPath === folderPath ? (
                          <Check className="w-3.5 h-3.5 text-[#00e575]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Stats badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {stats.laravel > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#ff2d55]/10 border border-[#ff2d55]/40 text-[#ff2d55]">
                          <Server className="w-3 h-3" />
                          <span>{stats.laravel} Laravel</span>
                        </span>
                      )}
                      {stats.git > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff]">
                          <GitBranch className="w-3 h-3" />
                          <span>{stats.git} Git Repos</span>
                        </span>
                      )}
                      {stats.dirty > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#ffc000]/10 border border-[#ffc000]/40 text-[#ffc000]">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-slate-200 hover:text-[#00e5ff] transition-all brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                    title={t('openInFinder')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>{t('openInFinder')}</span>
                  </button>

                  {/* Remove Folder Button */}
                  <button
                    onClick={() => onRemoveFolder(folderPath)}
                    disabled={folders.length <= 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-[#ff2d55]/10 hover:bg-[#ff2d55]/20 border border-[#ff2d55]/30 hover:border-[#ff2d55]/60 text-[#ff2d55] transition-all brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
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
          className="border-2 border-dashed border-[#2d3142] hover:border-[#00e5ff] rounded-md p-6 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group bg-[#090a0f] hover:bg-[#12141c]"
        >
          <div className="w-12 h-12 rounded-md bg-[#181b26] group-hover:bg-[#202534] border border-[#2d3142] group-hover:border-[#00e5ff] flex items-center justify-center text-[#00e5ff] transition-transform group-hover:scale-105 shadow-[1px_1px_0px_0px_#000]">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white group-hover:text-[#00e5ff] transition-colors">
              {t('addFolder')}
            </h4>
            <p className="text-xs text-slate-400 font-mono max-w-sm mt-0.5">
              {t('projectsDirHelp')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
