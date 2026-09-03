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
import { Tooltip } from './Tooltip';

interface ProjectListItemProps {
  project: ProjectItem;
  isFetching: boolean;
  onOpenLocation: (path: string) => void;
  onFetchRemote: (path: string, id: string) => void;
  onOpenStatus: (project: ProjectItem) => void;
  onSelectProject?: (project: ProjectItem) => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  isFetching,
  onOpenLocation,
  onFetchRemote,
  onOpenStatus,
  onSelectProject,
}) => {
  const { t } = useLanguage();

  return (
    <div className={`relative grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-4 items-center bg-[#12141c] hover:bg-[#161a24] border border-[#262a38] hover:border-[#3d4358] rounded-lg px-4 py-3 shadow-[2px_2px_0px_0px_#000] transition-all duration-100 group hover:z-30 ${
      project.isLaravel ? 'before:absolute before:left-0 rtl:before:left-auto rtl:before:right-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-[#ff2d55]' : ''
    }`}>
      {/* 1. Project Identity (Col 1) */}
      <div className="col-span-1 md:col-span-4 lg:col-span-3 xl:col-span-3 min-w-0 overflow-hidden">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 
              onClick={() => onSelectProject?.(project)}
              className="text-sm font-black text-white truncate tracking-tight cursor-pointer hover:text-[#00e5ff] transition-colors shrink-0 max-w-[60%]" 
              title={project.name}
            >
              {project.name}
            </h4>

            {project.rootFolderName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#090a0f] border border-[#262a38] text-slate-400 shrink-0" title={`Folder: ${project.rootPath || project.rootFolderName}`}>
                <Folder className="w-2.5 h-2.5 text-[#00e5ff] shrink-0" />
                <span className="truncate max-w-[65px]">{project.rootFolderName}</span>
              </span>
            )}

            {project.isLaravel && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff2d55]/15 border border-[#ff2d55]/40 text-[#ff2d55] shrink-0">
                Laravel{project.laravelVersion ? ` ${project.laravelVersion.replace(/[\^~]/g, '')}` : ''}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-mono truncate" title={project.path}>
            {project.path}
          </p>
        </div>
      </div>

      {/* 2. Branch Name (Col 2) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 min-w-0 overflow-hidden flex items-center">
        {project.isGit ? (
          <Tooltip content={`${t('branch')}: ${project.branch}`} className="min-w-0 max-w-full overflow-hidden">
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[#090a0f] hover:bg-[#151822] border border-[#2d3142] text-slate-200 min-w-0 max-w-full overflow-hidden shadow-[1px_1px_0px_0px_#000] transition-colors cursor-default" 
            >
              <GitBranch className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
              <span className="truncate block min-w-0 font-medium">{project.branch}</span>
            </span>
          </Tooltip>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-slate-500 border border-white/5 shrink-0">
            {t('noGit')}
          </span>
        )}
      </div>

      {/* 3. Current Git Status (Col 3) */}
      <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 min-w-0 overflow-hidden flex items-center gap-1.5 flex-wrap">
        {project.isGit && (
          <>
            {project.clean ? (
              <Tooltip content={t('cleanRepos')}>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#00e575]/10 border border-[#00e575]/40 text-[#00e575] shadow-[1px_1px_0px_0px_#000] shrink-0 cursor-default">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{t('cleanBadge')}</span>
                </span>
              </Tooltip>
            ) : (
              <Tooltip content={`${project.modifiedCount} ${t('modifiedRepos')}`}>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#ffc000]/10 border border-[#ffc000]/40 text-[#ffc000] shadow-[1px_1px_0px_0px_#000] shrink-0 cursor-default">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{project.modifiedCount} {t('modifiedBadge')}</span>
                </span>
              </Tooltip>
            )}

            {(project.ahead > 0 || project.behind > 0) && (
              <Tooltip content={`${project.ahead > 0 ? `${project.ahead} ${t('ahead')}` : ''} ${project.behind > 0 ? `${project.behind} ${t('behindMetric')}` : ''}`.trim()}>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] shadow-[1px_1px_0px_0px_#000] shrink-0 cursor-default">
                  {project.ahead > 0 && <span className="inline-flex items-center"><ArrowUp className="w-2.5 h-2.5" />{project.ahead}</span>}
                  {project.behind > 0 && <span className="inline-flex items-center"><ArrowDown className="w-2.5 h-2.5" />{project.behind}</span>}
                </span>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {/* 4. Latest Commit Info Preview (Col 4) - Visible on lg+ */}
      <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 min-w-0 overflow-hidden text-xs text-slate-300 pr-6 rtl:pr-0 rtl:pl-6">
        {project.lastCommit ? (
          <div className="flex flex-col gap-0.5 min-w-0 w-full overflow-hidden">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 min-w-0">
              <span className="font-mono text-[#00e5ff] font-bold shrink-0">{project.lastCommit.hash}</span>
              <span className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                <Clock className="w-2.5 h-2.5" />
                {project.lastCommit.timeAgo}
              </span>
            </div>
            <p className="line-clamp-2 break-words text-slate-200 text-[11px] leading-relaxed" title={project.lastCommit.message}>
              {project.lastCommit.message}
            </p>
          </div>
        ) : (
          <span className="text-slate-500 font-mono text-[11px] truncate">{t('noCommitData')}</span>
        )}
      </div>

      {/* 5. Action Buttons (Col 5) */}
      <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 min-w-0 flex items-center justify-start md:justify-end gap-1.5 shrink-0">
        {/* Location Tooltip */}
        <Tooltip content={t('openInFinder')}>
          <button
            onClick={() => onOpenLocation(project.path)}
            className="p-2 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e5ff]/50 text-slate-300 hover:text-[#00e5ff] brutal-press shadow-[1px_1px_0px_0px_#000] cursor-pointer shrink-0"
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
          </button>
        </Tooltip>

        {/* Fetch Tooltip */}
        <Tooltip content={isFetching ? t('fetching') : t('fetchRemote')}>
          <button
            onClick={() => onFetchRemote(project.path, project.id)}
            disabled={!project.isGit || isFetching}
            className={`p-2 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-indigo-400/50 text-slate-300 hover:text-indigo-300 brutal-press shadow-[1px_1px_0px_0px_#000] disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0 ${
              isFetching ? 'text-indigo-300 border-indigo-500/50' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </Tooltip>

        {/* Status Tooltip */}
        <Tooltip content={t('gitStatusTitle')}>
          <button
            onClick={() => onOpenStatus(project)}
            disabled={!project.isGit}
            className="p-2 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2d3142] hover:border-[#00e575]/50 text-slate-300 hover:text-[#00e575] brutal-press shadow-[1px_1px_0px_0px_#000] disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0"
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
