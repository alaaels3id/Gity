import React, { useEffect, useState } from 'react';
import { 
  X, 
  RefreshCw, 
  GitBranch, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  FileCode, 
  Terminal, 
  Folder 
} from 'lucide-react';
import { ProjectItem, GitStatusDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatusModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenFolder: (path: string) => void;
  onFetchRemote: (path: string, id: string) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  project,
  onClose,
  onOpenFolder,
  onFetchRemote,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<GitStatusDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (project) {
      loadStatus();
    }
  }, [project]);

  const loadStatus = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      if (!project.isGit) {
        setDetails(null);
        setLoading(false);
        return;
      }
      const api = window.gityAPI || window.api;
      const getStatusFn = api?.getStatus || api?.getGitStatus;
      if (getStatusFn) {
        const res = await getStatusFn(project.path);
        setDetails(res);
      } else {
        setError('Git status service is unavailable.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read git status');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!project) return;
    setIsFetching(true);
    try {
      await onFetchRemote(project.path, project.id);
      await loadStatus();
    } finally {
      setIsFetching(false);
    }
  };

  if (!project) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="studio-card bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{project.name}</h2>
                <span className={`w-2 h-2 rounded-full ${project.clean ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-md mt-0.5">{project.path}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg studio-btn text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {!project.isGit ? (
            <div className="rounded-2xl p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400">
                <GitBranch className="w-5 h-5 text-slate-400" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{t('noGit')}</span>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm font-normal leading-relaxed">
                This project directory does not contain an initialized Git repository.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-sky-500" />
              <span className="text-xs font-semibold text-sky-500">{t('inspectingGit')}</span>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-500 flex flex-col gap-2.5">
              <p className="font-bold text-sm">STATUS ERROR:</p>
              <p className="font-mono text-xs break-words">{error}</p>
              <button
                onClick={loadStatus}
                className="studio-btn self-start px-3 py-1 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : details ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('branch')}</span>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 mt-1 truncate">{details.branch}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('workingTree')}</span>
                  <span className={`text-xs font-bold mt-1 ${details.clean ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {details.clean ? t('cleanBadge') : `${details.filesCount} ${t('modifiedBadge')}`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('ahead')}</span>
                  <span className="text-xs font-mono font-bold text-sky-500 mt-1 inline-flex items-center gap-1">
                    <ArrowUp className="w-3.5 h-3.5" /> {details.ahead}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('behindMetric')}</span>
                  <span className="text-xs font-mono font-bold text-indigo-500 mt-1 inline-flex items-center gap-1">
                    <ArrowDown className="w-3.5 h-3.5" /> {details.behind}
                  </span>
                </div>
              </div>

              {/* Changed Files */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-sky-500" />
                    <span>{t('changedFiles')}</span>
                    <span className="studio-pill bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] py-0.5">
                      {details.filesCount}
                    </span>
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {details.files.length === 0 ? (
                    <div className="p-4 text-center text-xs text-emerald-500 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('cleanTreeDesc')}</span>
                    </div>
                  ) : (
                    details.files.map((file, index) => {
                      let badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                      if (file.type === 'untracked') badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
                      if (file.type === 'added') badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                      if (file.type === 'deleted') badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

                      return (
                        <div key={index} className="px-3.5 py-2 flex items-center gap-2.5 text-xs font-mono hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
                          <span className={`studio-pill text-[10px] py-0.5 ${badgeClass}`}>
                            {file.code || file.type}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200 truncate font-medium" title={file.path}>{file.path}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Diff Stat */}
              {details.diffStat && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-sky-500" />
                    <span>{t('diffSummary')}</span>
                  </span>
                  <pre className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-32" dir="ltr">
                    {details.diffStat}
                  </pre>
                </div>
              )}

              {/* Raw Git Status */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-500" />
                  <span>{t('rawGitOutput')}</span>
                </span>
                <pre className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36" dir="ltr">
                  {details.rawStatus}
                </pre>
              </div>
            </>
          ) : (
            <div className="rounded-2xl p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <span className="font-bold text-sm text-slate-900 dark:text-white">No status details available</span>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm font-normal leading-relaxed">
                Git was unable to inspect the status of this directory.
              </p>
              <button
                onClick={loadStatus}
                className="studio-btn px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {t('upstream')}: <span className="text-sky-600 dark:text-sky-400 font-mono font-semibold">{details?.tracking || 'NONE'}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFolder(project.path)}
              className="studio-btn px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5"
            >
              <Folder className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('openInFinder')}</span>
            </button>

            <button
              onClick={handleFetch}
              disabled={isFetching}
              className="studio-btn px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? t('fetching') : t('fetch')}</span>
            </button>

            <button
              onClick={onClose}
              className="studio-btn-primary px-4 py-1.5 text-xs cursor-pointer"
            >
              {t('doneBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
