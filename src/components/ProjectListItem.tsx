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
  Clock,
  Download
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tooltip } from './Tooltip';
import { BranchSelector } from './BranchSelector';
import { getTechMeta } from '../utils/projectType';

interface ProjectListItemProps {
  project: ProjectItem;
  isFetching: boolean;
  isPulling?: boolean;
  isBulkFetching?: boolean;
  isBulkPulling?: boolean;
  onOpenLocation: (path: string) => void;
  onFetchRemote: (path: string, id: string) => void;
  onPullProject?: (path: string, id: string) => void;
  onOpenStatus: (project: ProjectItem) => void;
  onSelectProject?: (project: ProjectItem) => void;
  onCheckoutBranch?: (path: string, branch: string, id: string) => Promise<boolean | void>;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  isFetching,
  isPulling = false,
  isBulkFetching = false,
  isBulkPulling = false,
  onOpenLocation,
  onFetchRemote,
  onPullProject,
  onOpenStatus,
  onSelectProject,
  onCheckoutBranch,
}) => {
  const { t } = useLanguage();

  const typeKey = project.projectType || (project.isLaravel ? 'laravel' : undefined);
  const techMeta = typeKey ? getTechMeta(typeKey) : null;
  const techLabel = project.framework || project.projectTypeLabel || techMeta?.label;
  const techVersion = project.laravelVersion 
    ? project.laravelVersion.replace(/[\^~]/g, '') 
    : project.frameworkVersion 
      ? project.frameworkVersion.replace(/[\^~]/g, '') 
      : null;

  return (
    <div className={`relative grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center bg-white dark:bg-[#131929] hover:bg-slate-50/90 dark:hover:bg-[#161f36] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-150 group ${
      techMeta && typeKey === 'laravel' ? 'before:absolute before:left-0 rtl:before:left-auto rtl:before:right-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#ff2d20]' : ''
    }`}>
      {/* 1. Project Identity (Col 1) */}
      <div className="col-span-1 md:col-span-4 lg:col-span-3 xl:col-span-3 min-w-0 pr-3 rtl:pr-0 rtl:pl-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Status LED */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              !project.isGit 
                ? 'bg-slate-400 dark:bg-slate-600' 
                : project.clean 
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                  : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
            }`} />

            <h4 
              onClick={() => onSelectProject?.(project)}
              className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight cursor-pointer hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex-1 min-w-0" 
              title={project.name}
            >
              {project.name}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 pl-4 rtl:pl-0 rtl:pr-4 overflow-hidden">
            {project.rootFolderName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 shrink-0 text-[10px] font-mono" title={`Volume: ${project.rootPath || project.rootFolderName}`}>
                <Folder className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                <span className="truncate max-w-[70px]">{project.rootFolderName}</span>
              </span>
            )}

            {techMeta && typeKey !== 'other' && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold border shrink-0 ${
                typeKey === 'laravel'
                  ? 'bg-[#ff2d20]/10 text-[#ff2d20] border-[#ff2d20]/30 dark:bg-[#ff2d20]/15 dark:border-[#ff2d20]/40 font-bold'
                  : `${techMeta.bgColor} ${techMeta.textColor} ${techMeta.borderColor}`
              }`} title={project.language || techMeta.label}>
                <span>{techLabel}</span>
                {techVersion && <span className="opacity-80 font-mono text-[9px]">{techVersion}</span>}
              </span>
            )}

            <span className="text-[10px] text-slate-400 font-mono truncate min-w-0 opacity-80" title={project.path}>
              {project.path}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Branch Name (Col 2) */}
      <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 min-w-0 flex items-center">
        {project.isGit ? (
          <BranchSelector
            currentBranch={project.branch}
            branches={project.branches}
            projectPath={project.path}
            onCheckout={onCheckoutBranch ? (b) => onCheckoutBranch(project.path, b, project.id) : undefined}
            disabled={isFetching || isPulling || isBulkFetching || isBulkPulling}
            size="md"
            className="w-full max-w-[160px]"
          />
        ) : (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-400 shrink-0">
            {t('noGit')}
          </span>
        )}
      </div>

      {/* 3. Current Git Status (Col 3) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 min-w-0 flex items-center gap-1.5 flex-wrap">
        {project.isGit && (
          <>
            {project.clean ? (
              <Tooltip content={t('cleanRepos')}>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0 cursor-default">
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                  <span>{t('cleanBadge')}</span>
                </span>
              </Tooltip>
            ) : (
              <Tooltip content={`${project.modifiedCount} ${t('modifiedRepos')}`}>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 cursor-default">
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                  <span>{project.modifiedCount} {t('modifiedBadge')}</span>
                </span>
              </Tooltip>
            )}

            {(project.ahead > 0 || project.behind > 0) && (
              <Tooltip content={`${project.ahead > 0 ? `${project.ahead} ${t('ahead')}` : ''} ${project.behind > 0 ? `${project.behind} ${t('behindMetric')}` : ''}`.trim()}>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 shrink-0 cursor-default">
                  {project.ahead > 0 && <span className="inline-flex items-center"><ArrowUp className="w-2.5 h-2.5" />{project.ahead}</span>}
                  {project.behind > 0 && <span className="inline-flex items-center"><ArrowDown className="w-2.5 h-2.5" />{project.behind}</span>}
                </span>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {/* 4. Latest Commit Info Preview (Col 4) */}
      <div className="hidden lg:flex lg:col-span-2 xl:col-span-3 min-w-0 overflow-hidden text-xs text-slate-700 dark:text-slate-300 pr-4 rtl:pr-0 rtl:pl-4">
        {project.lastCommit ? (
          <div className="flex flex-col gap-0.5 min-w-0 w-full overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 min-w-0">
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10 px-1 rounded shrink-0">{project.lastCommit.hash}</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {project.lastCommit.timeAgo}
              </span>
            </div>
            <p className="line-clamp-2 break-words text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-normal" title={project.lastCommit.message}>
              {project.lastCommit.message}
            </p>
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic truncate">{t('noCommitData')}</span>
        )}
      </div>

      {/* 5. Action Buttons (Col 5) */}
      <div className="col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-2 flex items-center justify-start md:justify-end gap-1.5 shrink-0">
        {/* Location */}
        <Tooltip content={t('openInFinder')}>
          <button
            onClick={() => onOpenLocation(project.path)}
            title={t('openInFinder')}
            className="studio-btn studio-btn-icon text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          </button>
        </Tooltip>

        {/* Fetch */}
        <Tooltip content={isFetching ? t('fetching') : t('fetchRemote')}>
          <button
            onClick={() => onFetchRemote(project.path, project.id)}
            disabled={!project.isGit || isFetching || isPulling || isBulkFetching || isBulkPulling}
            title={t('fetchRemote')}
            className={`studio-btn studio-btn-icon text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer ${
              isFetching ? 'text-sky-500 border-sky-500/50' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isFetching ? 'animate-spin text-sky-500' : 'text-sky-500'}`} />
          </button>
        </Tooltip>

        {/* Pull */}
        <Tooltip content={isPulling ? t('pulling') : t('pullNow')}>
          <button
            onClick={() => onPullProject?.(project.path, project.id)}
            disabled={!project.isGit || isPulling || isFetching || isBulkPulling || isBulkFetching}
            title={t('pullNow')}
            className={`studio-btn studio-btn-icon text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer ${
              isPulling ? 'text-emerald-500 border-emerald-500/50' : ''
            }`}
          >
            <Download className={`w-3.5 h-3.5 shrink-0 ${isPulling ? 'animate-bounce text-emerald-500' : 'text-emerald-500'}`} />
          </button>
        </Tooltip>

        {/* Status */}
        <Tooltip content={t('gitStatusTitle')}>
          <button
            onClick={() => onOpenStatus(project)}
            disabled={!project.isGit}
            title={t('gitStatusTitle')}
            className="studio-btn studio-btn-icon text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
