import React, { useEffect, useState } from 'react';
import { 
  X, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Folder, 
  RefreshCw, 
  FileCode,
  Terminal
} from 'lucide-react';
import { ProjectItem, DetailedGitStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatusModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenFolder: (path: string) => void;
  onFetchRemote: (path: string, id: string) => Promise<void>;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  project,
  onClose,
  onOpenFolder,
  onFetchRemote,
}) => {
  const { t } = useLanguage();
  const [details, setDetails] = useState<DetailedGitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!project) return;
    loadStatus();
  }, [project]);

  const loadStatus = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      const api = window.gityAPI || window.api;
      if (api?.getStatus) {
        const data = await api.getStatus(project.path);
        setDetails(data);
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111827] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{project.name}</h2>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">{project.path}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
              <span className="text-xs">{t('inspectingGit')}</span>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-400">
              <p className="font-semibold mb-1">Failed to read status:</p>
              <p className="font-mono">{error}</p>
            </div>
          ) : details ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('branch')}</span>
                  <span className="text-sm font-mono font-bold text-slate-200 mt-1 truncate">{details.branch}</span>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('workingTree')}</span>
                  <span className={`text-sm font-bold mt-1 ${details.clean ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {details.clean ? t('cleanBadge') : `${details.filesCount} ${t('modifiedBadge')}`}
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('ahead')}</span>
                  <span className="text-sm font-bold text-indigo-400 mt-1 inline-flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" /> {details.ahead}
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('behindMetric')}</span>
                  <span className="text-sm font-bold text-sky-400 mt-1 inline-flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" /> {details.behind}
                  </span>
                </div>
              </div>

              {/* Changed Files */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    {t('changedFiles')} ({details.filesCount})
                  </span>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl max-h-48 overflow-y-auto divide-y divide-white/5">
                  {details.files.length === 0 ? (
                    <div className="p-4 text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {t('cleanTreeDesc')}
                    </div>
                  ) : (
                    details.files.map((file, index) => {
                      let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      if (file.type === 'untracked') badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                      if (file.type === 'added') badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      if (file.type === 'deleted') badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

                      return (
                        <div key={index} className="px-3 py-1.5 flex items-center gap-2.5 text-xs font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                            {file.code || file.type}
                          </span>
                          <span className="text-slate-300 truncate" title={file.path}>{file.path}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Diff Stat */}
              {details.diffStat && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    {t('diffSummary')}
                  </span>
                  <pre className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-32" dir="ltr">
                    {details.diffStat}
                  </pre>
                </div>
              )}

              {/* Raw Git Status */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  {t('rawGitOutput')}
                </span>
                <pre className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36" dir="ltr">
                  {details.rawStatus}
                </pre>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-slate-900/50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono truncate">
            {t('upstream')}: <span className="text-slate-300">{details?.tracking || 'None'}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFolder(project.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 transition-colors"
            >
              <Folder className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('openInFinder')}</span>
            </button>

            <button
              onClick={handleFetch}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? t('fetching') : t('fetch')}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              {t('doneBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
