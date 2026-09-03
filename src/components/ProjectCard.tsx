import React from 'react';
import { 
  Folder, 
  RefreshCw, 
  Activity, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Clock 
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectCardProps {
  project: ProjectItem;
  isFetching: boolean;
  onOpenLocation: (path: string) => void;
  onFetchRemote: (path: string, id: string) => void;
  onOpenStatus: (project: ProjectItem) => void;
  onSelectProject?: (project: ProjectItem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isFetching,
  onOpenLocation,
  onFetchRemote,
  onOpenStatus,
  onSelectProject,
}) => {
  const { t, isRTL } = useLanguage();
  return (
    <div className={`relative h-full flex flex-col justify-between bg-[#12141c] hover:bg-[#161a24] border border-[#262a38] hover:border-[#3d4358] rounded-lg p-4 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-100 group overflow-hidden ${
      project.isLaravel ? 'before:absolute before:left-0 rtl:before:left-auto rtl:before:right-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-[#ff2d55]' : ''
    }`}>
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 
                onClick={() => onSelectProject?.(project)}
                className="text-base font-black text-white truncate tracking-tight cursor-pointer hover:text-[#00e5ff] transition-colors" 
                title="Click to view full project details & modifications"
              >
                {project.name}
              </h3>
              <button
                onClick={() => onSelectProject?.(project)}
                className="text-[11px] font-mono font-bold text-slate-400 hover:text-[#00e5ff] transition-colors flex items-center gap-0.5 flex-shrink-0 cursor-pointer"
              >
                <span>{t('details')}</span>
                <span>{isRTL ? '←' : '→'}</span>
              </button>
            </div>
            
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {project.rootFolderName && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#090a0f] border border-[#262a38] text-slate-400" title={`Folder: ${project.rootPath || project.rootFolderName}`}>
                  <Folder className="w-2.5 h-2.5 text-[#00e5ff]" />
                  <span className="truncate max-w-[90px]">{project.rootFolderName}</span>
                </span>
              )}

              {project.isLaravel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff2d55]/15 border border-[#ff2d55]/40 text-[#ff2d55]">
                  <span>Laravel</span>
                  {project.laravelVersion && (
                    <span className="opacity-80 font-mono text-[10px]">
                      {project.laravelVersion.replace(/[\^~]/g, '')}
                    </span>
                  )}
                </span>
              )}

              {project.isGit ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#090a0f] border border-[#2d3142] text-slate-300">
                    <GitBranch className="w-2.5 h-2.5 text-[#00e5ff]" />
                    <span className="truncate max-w-[110px]">{project.branch}</span>
                  </span>

                  {project.clean ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#00e575]/10 border border-[#00e575]/40 text-[#00e575]">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{t('cleanBadge')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#ffc000]/10 border border-[#ffc000]/40 text-[#ffc000]">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>{project.modifiedCount} {t('modifiedBadge')}</span>
                    </span>
                  )}

                  {(project.ahead > 0 || project.behind > 0) && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff]">
                      {project.ahead > 0 && <span className="inline-flex items-center"><ArrowUp className="w-2.5 h-2.5" />{project.ahead}</span>}
                      {project.behind > 0 && <span className="inline-flex items-center"><ArrowDown className="w-2.5 h-2.5" />{project.behind}</span>}
                    </span>
                  )}
                </>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-slate-400 border border-white/5">
                  {t('noGit')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Latest Commit Preview */}
        <div className="bg-[#090a0f] border border-[#262a38] rounded-md p-2.5 text-xs text-slate-300 mb-3.5 flex flex-col gap-1 shadow-inner">
          {project.lastCommit ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="text-[#00e5ff] font-bold">{project.lastCommit.hash}</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                  <Clock className="w-2.5 h-2.5" />
                  {project.lastCommit.timeAgo}
                </span>
              </div>
              <div className="line-clamp-2 break-words text-slate-200 text-xs leading-relaxed" title={project.lastCommit.message}>
                {project.lastCommit.message}
              </div>
            </>
          ) : (
            <span className="text-slate-500 font-mono text-[11px]">{t('noCommitData')}</span>
          )}
        </div>
      </div>

      {/* The Three Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#262a38]">
        {/* 1. Go to project location */}
        <button
          onClick={() => onOpenLocation(project.path)}
          title="Reveal in macOS Finder"
          className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-slate-200 hover:text-[#00e5ff] brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer"
        >
          <Folder className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>{t('location')}</span>
        </button>

        {/* 2. Fetch all changes from remote */}
        <button
          onClick={() => onFetchRemote(project.path, project.id)}
          disabled={!project.isGit || isFetching}
          title="Execute git fetch --all --prune"
          className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-indigo-400/50 text-slate-200 hover:text-indigo-300 brutal-press shadow-[1px_1px_0px_0px_#000] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
            isFetching ? 'text-indigo-300 border-indigo-500/50' : ''
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? t('fetching') : t('fetch')}</span>
        </button>

        {/* 3. The current status */}
        <button
          onClick={() => onOpenStatus(project)}
          disabled={!project.isGit}
          title="Inspect Git working tree status"
          className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono font-bold bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e575]/50 text-slate-200 hover:text-[#00e575] brutal-press shadow-[1px_1px_0px_0px_#000] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-[#00e575]" />
          <span>{t('status')}</span>
        </button>
      </div>
    </div>
  );
};
