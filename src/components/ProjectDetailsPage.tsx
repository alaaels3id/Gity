import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Folder, 
  RefreshCw, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Globe, 
  Code, 
  Terminal, 
  Database, 
  Server, 
  FileCode, 
  Copy, 
  ExternalLink,
  Check,
  Search,
  ChevronRight,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { ProjectItem, ProjectDetails, ChangedFile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectDetailsPageProps {
  project: ProjectItem;
  onBack: () => void;
  onOpenFolder: (path: string) => void;
  onFetchRemote: (path: string, id: string) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  editor?: string;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  project,
  onBack,
  onOpenFolder,
  onFetchRemote,
  onShowToast,
  editor = 'code',
}) => {
  const { t, isRTL } = useLanguage();
  const [details, setDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ChangedFile | null>(null);
  const [fileDiff, setFileDiff] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [project.path]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.getProjectDetails) {
        const res = await api.getProjectDetails(project.path);
        setDetails(res);
        if (res.status?.files?.length > 0) {
          loadFileDiff(res.status.files[0]);
        }
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      await onFetchRemote(project.path, project.id);
      await loadDetails();
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenEditor = async () => {
    const api = window.gityAPI || window.api;
    if (api?.openEditor) {
      try {
        await api.openEditor(project.path, editor);
        onShowToast(`Opened in ${editor}`, 'success');
      } catch (err: any) {
        onShowToast(`Could not open in editor: ${err.message}`, 'error');
      }
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(project.path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
    onShowToast(t('pathCopied'), 'info');
  };

  const loadFileDiff = async (file: ChangedFile) => {
    setSelectedFile(file);
    setDiffLoading(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.getFileDiff) {
        const diff = await api.getFileDiff(project.path, file.path);
        setFileDiff(diff || '(No diff or file is untracked/new)');
      }
    } catch {
      setFileDiff('Unable to inspect diff for this file.');
    } finally {
      setDiffLoading(false);
    }
  };

  const filteredFiles = (details?.status?.files || []).filter(f =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#090d16] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Titlebar / Nav */}
      <div className="bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 px-6 pb-3.5 flex-shrink-0 z-20">
        <div className="titlebar-drag h-10 w-full" />

        <div className="no-drag flex items-center justify-between gap-4">
          {/* Back button + Project Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-white/10"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('backToProjects')}</span>
            </button>

            <div className="h-4 w-[1px] bg-white/15 mx-1" />

            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white tracking-tight">{project.name}</h2>
              
              {project.isLaravel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  Laravel{project.laravelVersion ? ` ${project.laravelVersion.replace(/[\^~]/g, '')}` : ''}
                </span>
              )}

              {details?.status && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  {details.status.branch}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPath}
              title="Copy absolute path"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 transition-colors"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{t('copyPath')}</span>
            </button>

            <button
              onClick={() => onOpenFolder(project.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-sky-300 transition-colors"
            >
              <Folder className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('openInFinder')}</span>
            </button>

            <button
              onClick={handleOpenEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-indigo-300 transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('openInEditor')}</span>
            </button>

            <button
              onClick={handleFetch}
              disabled={isFetching || !project.isGit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? t('fetching') : t('fetchRemote')}</span>
            </button>

            <button
              onClick={loadDetails}
              title="Refresh project details"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Details (Left) + Modifications (Right) */}
      <main className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs">Loading project details and git modifications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* LEFT COLUMN: All Project Details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Git Overview Card */}
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    {t('gitStatusTitle')}
                  </span>
                  {details?.status?.clean ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('cleanBadge')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <AlertCircle className="w-3 h-3" />
                      {details?.status?.filesCount || 0} {t('modifiedBadge')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('branch')}</span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-1 truncate">
                      {details?.status?.branch || 'None'}
                    </span>
                  </div>

                  <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('ahead')}</span>
                    <span className="text-xs font-bold text-indigo-400 mt-1 inline-flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" /> {details?.status?.ahead || 0}
                    </span>
                  </div>

                  <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('behindMetric')}</span>
                    <span className="text-xs font-bold text-sky-400 mt-1 inline-flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" /> {details?.status?.behind || 0}
                    </span>
                  </div>
                </div>

                {/* Upstream & Path */}
                <div className="text-xs flex flex-col gap-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('upstream')}:</span>
                    <span className="font-mono text-slate-300">{details?.status?.tracking || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('pathLabel')}:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[220px]" title={project.path}>
                      {project.path}
                    </span>
                  </div>
                </div>
              </div>

              {/* Laravel & Environment Specs */}
              {project.isLaravel && (
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-rose-400" />
                    {t('laravelSpecs')}
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('framework')}</span>
                      <span className="text-rose-400 font-semibold font-mono">
                        Laravel {project.laravelVersion ? project.laravelVersion.replace(/[\^~]/g, '') : 'Unknown'}
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('phpConstraint')}</span>
                      <span className="text-slate-200 font-semibold font-mono">
                        {project.phpVersion || 'Any'}
                      </span>
                    </div>

                    {details?.envInfo?.appEnv && (
                      <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('environment')}</span>
                        <span className="text-emerald-400 font-semibold uppercase">
                          {details.envInfo.appEnv}
                        </span>
                      </div>
                    )}

                    {details?.envInfo?.dbConnection && (
                      <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Database className="w-2.5 h-2.5 text-slate-400" /> {t('database')}
                        </span>
                        <span className="text-indigo-300 font-semibold uppercase">
                          {details.envInfo.dbConnection}
                        </span>
                      </div>
                    )}
                  </div>

                  {details?.composerInfo?.description && (
                    <div className="text-xs text-slate-400 bg-black/20 p-2 rounded-lg border border-white/5">
                      <p className="italic">{details.composerInfo.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Git Remotes */}
              {details?.remotes && details.remotes.length > 0 && (
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    {t('remotesTitle')}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {details.remotes.map((remote, idx) => (
                      <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 font-mono">{remote.name}</span>
                        <span className="text-slate-400 font-mono text-[11px] truncate max-w-[260px]" title={remote.url}>
                          {remote.url}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Commits Timeline */}
              {details?.recentCommits && details.recentCommits.length > 0 && (
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    {t('recentCommitsTitle')}
                  </span>
                  <div className="flex flex-col divide-y divide-white/5">
                    {details.recentCommits.map((commit, idx) => (
                      <div key={idx} className="py-2 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-indigo-400 font-semibold">{commit.hash}</span>
                          <span className="text-[11px] text-slate-400">{commit.timeAgo}</span>
                        </div>
                        <span className="text-slate-200 font-medium truncate" title={commit.message}>
                          {commit.message}
                        </span>
                        <span className="text-[11px] text-slate-400">by {commit.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: List of Modifications (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4 h-full">
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex-1 flex flex-col shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      {t('modificationsTitle')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                      {details?.status?.filesCount || 0}
                    </span>
                  </div>

                  {details?.status && !details.status.clean && (
                    <div className="relative w-48">
                      <Search className={`w-3 h-3 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-2.5' : 'left-2.5'}`} />
                      <input
                        type="text"
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        placeholder={t('filterFilesPlaceholder')}
                        className={`w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-lg py-1 text-xs text-white outline-none ${
                          isRTL ? 'pr-7 pl-2' : 'pl-7 pr-2'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Body: Modified files or Clean state */}
                {details?.status?.clean ? (
                  /* Clean State (No modifications) */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-white">{t('cleanTreeTitle')}</h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      {t('cleanTreeDesc')}
                    </p>
                    {details.status.tracking && (
                      <span className="text-xs font-mono text-slate-400 mt-2 bg-black/30 border border-white/5 px-3 py-1.5 rounded-lg">
                        {t('syncedWith')} <code className="text-indigo-400">{details.status.tracking}</code>
                      </span>
                    )}
                  </div>
                ) : (
                  /* Modifications Exist */
                  <div className="flex-1 flex flex-col gap-3 pt-3 overflow-hidden">
                    {/* Files list */}
                    <div className="max-h-48 overflow-y-auto bg-black/40 border border-white/10 rounded-xl divide-y divide-white/5 flex-shrink-0">
                      {filteredFiles.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No matching files.</div>
                      ) : (
                        filteredFiles.map((file, idx) => {
                          const isSelected = selectedFile?.path === file.path;
                          let badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                          if (file.type === 'untracked') badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                          if (file.type === 'added') badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                          if (file.type === 'deleted') badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

                          return (
                            <button
                              key={idx}
                              onClick={() => loadFileDiff(file)}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors ${
                                isSelected ? 'bg-indigo-600/20 border-l-2 border-indigo-500' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badgeStyle}`}>
                                  {file.code || file.type}
                                </span>
                                <span className="truncate text-slate-200" title={file.path}>
                                  {file.path}
                                </span>
                              </div>
                              {isRTL ? (
                                <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 ${isSelected ? 'text-indigo-400' : ''}`} />
                              ) : (
                                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isSelected ? 'text-indigo-400' : ''}`} />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Diff Viewer for selected file */}
                    <div className="flex-1 flex flex-col bg-black/60 border border-white/10 rounded-xl overflow-hidden min-h-[260px]">
                      <div className="px-3.5 py-2 bg-slate-900/80 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{selectedFile ? selectedFile.path : t('selectFileToInspect')}</span>
                        </span>
                        {selectedFile && (
                          <span className="text-[11px] text-slate-400 uppercase font-semibold">
                            {selectedFile.label}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed select-text" dir="ltr">
                        {diffLoading ? (
                          <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                            <span>Loading diff...</span>
                          </div>
                        ) : fileDiff ? (
                          fileDiff.split('\n').map((line, lIdx) => {
                            let lineClass = 'text-slate-300';
                            let bgClass = '';
                            if (line.startsWith('+') && !line.startsWith('+++')) {
                              lineClass = 'text-emerald-300';
                              bgClass = 'bg-emerald-500/10';
                            } else if (line.startsWith('-') && !line.startsWith('---')) {
                              lineClass = 'text-rose-300';
                              bgClass = 'bg-rose-500/10';
                            } else if (line.startsWith('@@')) {
                              lineClass = 'text-sky-400 font-bold';
                              bgClass = 'bg-sky-500/10';
                            }

                            return (
                              <div key={lIdx} className={`${lineClass} ${bgClass} px-1.5 py-0.5 rounded whitespace-pre-wrap font-mono`}>
                                {line}
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            {t('selectFileToInspect')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diff Stat Summary */}
                    {details?.status?.diffStat && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {t('summaryStats')}
                        </span>
                        <pre className="bg-black/40 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-20" dir="ltr">
                          {details.status.diffStat}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
