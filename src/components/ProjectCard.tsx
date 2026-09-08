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
  Sparkles,
  Download
} from 'lucide-react';
import { ProjectItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tooltip } from './Tooltip';
import { BranchSelector } from './BranchSelector';
import { getTechMeta } from '../utils/projectType';

interface ProjectCardProps {
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

export const ProjectCard: React.FC<ProjectCardProps> = ({
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
  const { t, isRTL } = useLanguage();

  const typeKey = project.projectType || (project.isLaravel ? 'laravel' : undefined);
  const techMeta = typeKey ? getTechMeta(typeKey) : null;
  const techLabel = project.framework || project.projectTypeLabel || techMeta?.label;
  const techVersion = project.laravelVersion 
    ? project.laravelVersion.replace(/[\^~]/g, '') 
    : project.frameworkVersion 
      ? project.frameworkVersion.replace(/[\^~]/g, '') 
      : null;

  return (
    <div className={`relative h-full flex flex-col justify-between bg-white dark:bg-[#131929] hover:bg-slate-50/90 dark:hover:bg-[#161f36] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-150 group ${
      techMeta && typeKey === 'laravel' ? 'before:absolute before:top-0 before:left-3 before:right-3 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#ff2d20] before:to-transparent before:opacity-80' : ''
    }`}>
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  !project.isGit 
                    ? 'bg-slate-400 dark:bg-slate-600' 
                    : project.clean 
                      ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                      : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                }`} />
                <h3 
                  onClick={() => onSelectProject?.(project)}
                  className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight cursor-pointer hover:text-sky-500 dark:hover:text-sky-400 transition-colors" 
                  title={project.name}
                >
                  {project.name}
                </h3>
              </div>

              <button
                onClick={() => onSelectProject?.(project)}
                className="text-xs font-semibold text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              >
                <span>{t('details')}</span>
                <span className="text-[10px]">{isRTL ? '←' : '→'}</span>
              </button>
            </div>
            
            {/* Badges row with refined Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {project.rootFolderName && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 text-[10px] font-mono" title={`Volume: ${project.rootPath || project.rootFolderName}`}>
                  <Folder className="w-2.5 h-2.5 text-sky-500" />
                  <span className="truncate max-w-[80px]">{project.rootFolderName}</span>
                </span>
              )}

              {techMeta && typeKey !== 'other' && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                  typeKey === 'laravel'
                    ? 'bg-[#ff2d20]/10 text-[#ff2d20] border-[#ff2d20]/30 dark:bg-[#ff2d20]/15 dark:border-[#ff2d20]/40 font-bold'
                    : `${techMeta.bgColor} ${techMeta.textColor} ${techMeta.borderColor}`
                }`} title={project.language || techMeta.label}>
                  <span>{techLabel}</span>
                  {techVersion && (
                    <span className="opacity-90 font-mono text-[9px]">
                      {techVersion}
                    </span>
                  )}
                </span>
              )}

              {project.isGit ? (
                <>
                  <BranchSelector
                    currentBranch={project.branch}
                    branches={project.branches}
                    projectPath={project.path}
                    onCheckout={onCheckoutBranch ? (b) => onCheckoutBranch(project.path, b, project.id) : undefined}
                    disabled={isFetching || isPulling || isBulkFetching || isBulkPulling}
                    size="sm"
                    className="max-w-[130px]"
                  />

                  {project.clean ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{t('cleanBadge')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>{project.modifiedCount} {t('modifiedBadge')}</span>
                    </span>
                  )}

                  {(project.ahead > 0 || project.behind > 0) && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400">
                      {project.ahead > 0 && <span className="inline-flex items-center"><ArrowUp className="w-2.5 h-2.5" />{project.ahead}</span>}
                      {project.behind > 0 && <span className="inline-flex items-center"><ArrowDown className="w-2.5 h-2.5" />{project.behind}</span>}
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-400">
                  {t('noGit')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Commit Card Preview */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0d14]/70 border border-slate-200/70 dark:border-white/[0.06] mb-3 flex flex-col gap-1">
          {project.lastCommit ? (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-sky-600 dark:text-sky-400 font-mono font-bold text-[10px] bg-sky-500/10 px-1 rounded">
                  {project.lastCommit.hash}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Clock className="w-2.5 h-2.5" />
                  {project.lastCommit.timeAgo}
                </span>
              </div>
              <div className="line-clamp-2 break-words text-slate-700 dark:text-slate-300 text-[11px] font-normal leading-relaxed" title={project.lastCommit.message}>
                {project.lastCommit.message}
              </div>
            </>
          ) : (
            <span className="text-slate-400 text-xs italic">{t('noCommitData')}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06]">
        {/* 1. Reveal in Finder */}
        <Tooltip content={t('openInFinder')} className="w-full">
          <button
            onClick={() => onOpenLocation(project.path)}
            title={t('openInFinder')}
            aria-label={t('openInFinder')}
            className="studio-btn w-full h-8 !px-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer justify-center"
          >
            <Folder className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          </button>
        </Tooltip>

        {/* 2. Fetch */}
        <Tooltip content={isFetching ? t('fetching') : t('fetchRemote')} className="w-full">
          <button
            onClick={() => onFetchRemote(project.path, project.id)}
            disabled={!project.isGit || isFetching || isPulling || isBulkFetching || isBulkPulling}
            title={t('fetchRemote')}
            aria-label={t('fetchRemote')}
            className={`studio-btn w-full h-8 !px-0 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer justify-center ${
              isFetching ? 'text-sky-500 border-sky-500/50' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 shrink-0 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </Tooltip>

        {/* 3. Pull */}
        <Tooltip content={isPulling ? t('pulling') : t('pullNow')} className="w-full">
          <button
            onClick={() => onPullProject?.(project.path, project.id)}
            disabled={!project.isGit || isPulling || isFetching || isBulkPulling || isBulkFetching}
            title={t('pullNow')}
            aria-label={t('pullNow')}
            className={`studio-btn w-full h-8 !px-0 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer justify-center ${
              isPulling ? 'text-emerald-500 border-emerald-500/50' : ''
            }`}
          >
            <Download className={`w-3.5 h-3.5 text-emerald-500 shrink-0 ${isPulling ? 'animate-bounce' : ''}`} />
          </button>
        </Tooltip>

        {/* 4. Status */}
        <Tooltip content={t('gitStatusTitle')} className="w-full">
          <button
            onClick={() => onOpenStatus(project)}
            disabled={!project.isGit}
            title={t('gitStatusTitle')}
            aria-label={t('gitStatusTitle')}
            className="studio-btn w-full h-8 !px-0 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer justify-center"
          >
            <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
