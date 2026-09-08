import React, { useEffect, useState } from 'react';
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
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Server, 
  Terminal, 
  Globe, 
  Database,
  Code,
  FileText,
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  Edit3,
  Plus,
  X,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { ProjectItem, ProjectDetails, ChangedFile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BranchSelector } from './BranchSelector';
import { getTechMeta } from '../utils/projectType';
import { generateCommitMessage } from '../utils/commitMessage';

interface ProjectDetailsPageProps {
  project: ProjectItem;
  onBack: () => void;
  onOpenFolder: (path: string) => void;
  onFetchRemote: (path: string, id: string) => void;
  onPullProject?: (path: string, id: string) => void;
  onPushProject?: (path: string, id: string) => Promise<any>;
  isPulling?: boolean;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onCheckoutBranch?: (path: string, branch: string, id: string) => Promise<boolean | void>;
  onResetChanges?: (path: string, id: string, options?: { filePath?: string; includeUntracked?: boolean }) => Promise<any>;
  editor?: string;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  project,
  onBack,
  onOpenFolder,
  onFetchRemote,
  onPullProject,
  onPushProject,
  isPulling: externalIsPulling,
  onShowToast,
  onCheckoutBranch,
  onResetChanges,
  editor = 'code',
}) => {
  const { t, isRTL } = useLanguage();
  const [details, setDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPullingInternal, setIsPullingInternal] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isCommittingAndPushing, setIsCommittingAndPushing] = useState(false);
  const [showCommitPushModal, setShowCommitPushModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [generationStyleIndex, setGenerationStyleIndex] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [includeUntracked, setIncludeUntracked] = useState(true);
  const [discardingFile, setDiscardingFile] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ChangedFile | null>(null);
  const [fileDiff, setFileDiff] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState('');

  const isPulling = externalIsPulling ?? isPullingInternal;

  useEffect(() => {
    loadDetails();
  }, [project.path]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.getProjectDetails) {
        const data = await api.getProjectDetails(project.path);
        setDetails(data);
        if (data?.status?.files && data.status.files.length > 0) {
          loadFileDiff(data.status.files[0]);
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      await onFetchRemote(project.path, project.id);
      await loadDetails();
      onShowToast?.('Fetch complete', 'success');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePull = async () => {
    setIsPullingInternal(true);
    try {
      if (onPullProject) {
        await onPullProject(project.path, project.id);
      } else {
        const api = window.gityAPI || window.api;
        if (api?.pullProject) {
          const res = await api.pullProject(project.path);
          if (res.success) {
            onShowToast?.(`Pulled in ${res.duration}`, 'success');
          } else {
            onShowToast?.(res.message, 'error');
          }
        }
      }
      await loadDetails();
    } finally {
      setIsPullingInternal(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      if (onPushProject) {
        const res = await onPushProject(project.path, project.id);
        if (res && !res.success) {
          onShowToast?.(res.message || t('pushFailed'), 'error');
        } else if (res && res.success) {
          onShowToast?.(t('pushSuccess'), 'success');
        }
      } else {
        const api = window.gityAPI || window.api;
        if (api?.pushProject) {
          const res = await api.pushProject(project.path);
          if (res.success) {
            onShowToast?.(t('pushSuccess'), 'success');
          } else {
            onShowToast?.(res.message || t('pushFailed'), 'error');
          }
        }
      }
      await loadDetails();
    } catch (err: any) {
      onShowToast?.(err.message || t('pushFailed'), 'error');
    } finally {
      setIsPushing(false);
    }
  };

  const handleOpenCommitModal = () => {
    const autoMsg = generateCommitMessage(
      details?.status?.files || [],
      details?.status?.branch || project.branch,
      0
    );
    // If empty or never customized, auto-populate with generated message
    if (!commitMessage.trim()) {
      setCommitMessage(autoMsg);
      setGenerationStyleIndex(0);
    }
    setShowCommitPushModal(true);
  };

  const handleAutoGenerateCommitMessage = () => {
    const nextIndex = generationStyleIndex + 1;
    const newMsg = generateCommitMessage(
      details?.status?.files || [],
      details?.status?.branch || project.branch,
      nextIndex
    );
    setGenerationStyleIndex(nextIndex);
    setCommitMessage(newMsg);
    onShowToast?.(t('generatedMsgSuccess'), 'info');
  };

  const handleCommitAndPush = async () => {
    const msg = commitMessage.trim() || 'Update project files';
    setIsCommittingAndPushing(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.commitAndPush) {
        const res = await api.commitAndPush(project.path, msg);
        if (res.success) {
          onShowToast?.(res.message || t('pushSuccess'), 'success');
          setShowCommitPushModal(false);
          setCommitMessage('');
          setSelectedFile(null);
          setFileDiff(null);
          await loadDetails();
        } else {
          onShowToast?.(res.message || t('pushFailed'), 'error');
        }
      } else {
        onShowToast?.('Git commit and push service is unavailable', 'error');
      }
    } catch (err: any) {
      onShowToast?.(err.message || t('pushFailed'), 'error');
    } finally {
      setIsCommittingAndPushing(false);
    }
  };

  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      if (onResetChanges) {
        await onResetChanges(project.path, project.id, { includeUntracked });
      } else {
        const api = window.gityAPI || window.api;
        if (api?.resetChanges) {
          const res = await api.resetChanges(project.path, { includeUntracked });
          if (res.success) {
            onShowToast?.(res.message || t('resetSuccess'), 'success');
          } else {
            onShowToast?.(res.message || 'Reset failed', 'error');
          }
        }
      }
      setShowResetModal(false);
      setSelectedFile(null);
      setFileDiff(null);
      await loadDetails();
    } finally {
      setIsResetting(false);
    }
  };

  const handleDiscardFile = async (filePath: string) => {
    if (!confirm(t('discardFileConfirm', { file: filePath }))) return;
    setDiscardingFile(filePath);
    try {
      if (onResetChanges) {
        await onResetChanges(project.path, project.id, { filePath });
      } else {
        const api = window.gityAPI || window.api;
        if (api?.resetChanges) {
          const res = await api.resetChanges(project.path, { filePath });
          if (res.success) {
            onShowToast?.(res.message, 'success');
          } else {
            onShowToast?.(res.message, 'error');
          }
        }
      }
      if (selectedFile?.path === filePath) {
        setSelectedFile(null);
        setFileDiff(null);
      }
      await loadDetails();
    } finally {
      setDiscardingFile(null);
    }
  };

  // Remote URL configuration state
  const [editingRemoteName, setEditingRemoteName] = useState<string | null>(null);
  const [editingRemoteUrl, setEditingRemoteUrl] = useState('');
  const [isSavingRemote, setIsSavingRemote] = useState(false);

  const startEditRemote = (name: string, currentUrl: string) => {
    setEditingRemoteName(name);
    setEditingRemoteUrl(currentUrl);
  };

  const cancelEditRemote = () => {
    setEditingRemoteName(null);
    setEditingRemoteUrl('');
  };

  const handleSaveRemoteUrl = async (remoteName: string) => {
    const trimmedUrl = editingRemoteUrl.trim();
    if (!trimmedUrl) {
      onShowToast?.('Remote URL cannot be empty', 'error');
      return;
    }

    setIsSavingRemote(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.setRemoteUrl) {
        const res = await api.setRemoteUrl(project.path, remoteName, trimmedUrl);
        if (res.success) {
          if (res.remotes) {
            setDetails(prev => prev ? { ...prev, remotes: res.remotes! } : null);
          } else {
            await loadDetails();
          }
          onShowToast?.(res.message, 'success');
          cancelEditRemote();
        } else {
          onShowToast?.(res.message, 'error');
        }
      }
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update remote URL', 'error');
    } finally {
      setIsSavingRemote(false);
    }
  };

  const handleCheckoutBranch = async (branchName: string) => {
    try {
      if (onCheckoutBranch) {
        await onCheckoutBranch(project.path, branchName, project.id);
      } else {
        const api = window.gityAPI || window.api;
        if (api?.checkoutBranch) {
          const res = await api.checkoutBranch(project.path, branchName);
          if (res.success) {
            onShowToast?.(t('branchSwitched', { branch: branchName }), 'success');
          } else {
            onShowToast?.(t('branchCheckoutFailed', { error: res.message }), 'error');
            return;
          }
        }
      }
      await loadDetails();
    } catch (err: any) {
      onShowToast?.(err.message || 'Checkout failed', 'error');
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(project.path);
    setCopiedPath(true);
    onShowToast?.(t('pathCopied'), 'success');
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleOpenEditor = async () => {
    try {
      const api = window.gityAPI || window.api;
      const openFn = api?.openEditor || api?.openInEditor;
      if (openFn) {
        await openFn(project.path, editor);
        onShowToast?.(`Opened in ${editor || 'editor'}`, 'success');
      } else {
        onShowToast?.('Editor launcher is unavailable', 'error');
      }
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to open editor', 'error');
    }
  };

  const loadFileDiff = async (file: ChangedFile) => {
    setSelectedFile(file);
    setDiffLoading(true);
    try {
      const api = window.gityAPI || window.api;
      if (api?.getFileDiff) {
        const diff = await api.getFileDiff(project.path, file.path);
        setFileDiff(diff || 'No diff output for this file.');
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
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0d111d] text-slate-800 dark:text-slate-100 select-none overflow-hidden">
      {/* Top Titlebar / Nav */}
      <div className="bg-white/95 dark:bg-[#121728]/95 backdrop-blur-xl border-b-2 border-slate-200 dark:border-[#29365c] px-6 pb-4 flex-shrink-0 z-20 shadow-sm">
        <div className="titlebar-drag h-10 w-full" />

        <div className="no-drag flex items-center justify-between gap-4">
          {/* Back button + Project Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="studio-btn h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-2 shrink-0"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5 text-sky-500" /> : <ArrowLeft className="w-3.5 h-3.5 text-sky-500" />}
              <span className="whitespace-nowrap">{t('backToProjects')}</span>
              <kbd className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
                ESC
              </kbd>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${project.clean ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">{project.name}</h2>
              
              {(() => {
                const typeKey = project.projectType || (project.isLaravel ? 'laravel' : undefined);
                if (!typeKey || typeKey === 'other') return null;
                const meta = getTechMeta(typeKey);
                const label = project.framework || project.projectTypeLabel || meta.label;
                const version = project.laravelVersion 
                  ? project.laravelVersion.replace(/[\^~]/g, '') 
                  : project.frameworkVersion 
                    ? project.frameworkVersion.replace(/[\^~]/g, '') 
                    : null;
                return (
                  <span className={`inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded-md font-semibold border shrink-0 ${
                    typeKey === 'laravel' 
                      ? 'bg-[#ff2d20]/10 text-[#ff2d20] border-[#ff2d20]/30 dark:bg-[#ff2d20]/15 dark:border-[#ff2d20]/40 font-bold' 
                      : `${meta.bgColor} ${meta.textColor} ${meta.borderColor}`
                  }`}>
                    {label}{version ? ` ${version}` : ''}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Action buttons with organized grouping and balanced spacing */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Inspector tools */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyPath}
                title="Copy absolute path"
                className="studio-btn h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-sky-500" />}
                <span>{t('copyPath')}</span>
              </button>

              <button
                onClick={() => onOpenFolder(project.path)}
                className="studio-btn h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5 whitespace-nowrap shrink-0"
              >
                <Folder className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('openInFinder')}</span>
              </button>

              <button
                onClick={handleOpenEditor}
                className="studio-btn h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5 whitespace-nowrap shrink-0"
              >
                <Code className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('openInEditor')}</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5" />

            {/* Sync and Refresh actions */}
            <div className="flex items-center gap-1.5">
              {/* Reset Changes button when there are uncommitted modifications */}
              {project.isGit && (!project.clean || (details?.status && !details.status.clean)) && (
                <button
                  onClick={() => setShowResetModal(true)}
                  disabled={isResetting || isFetching || isPulling}
                  className="studio-btn h-8 px-2.5 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
                  title={t('resetAllChanges')}
                >
                  <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isResetting ? 'animate-spin' : ''}`} />
                  <span className="whitespace-nowrap font-semibold">
                    {isResetting ? t('resettingChanges') : t('resetChanges')}
                  </span>
                </button>
              )}

              <button
                onClick={handleFetch}
                disabled={isFetching || isPulling || isPushing || !project.isGit}
                className="studio-btn h-8 px-3 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 text-sky-500 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">{isFetching ? t('fetching') : t('fetchRemote')}</span>
              </button>

              <button
                onClick={handlePull}
                disabled={isPulling || isFetching || isPushing || !project.isGit}
                className="studio-btn-primary h-8 px-3 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                <Download className={`w-3.5 h-3.5 shrink-0 ${isPulling ? 'animate-bounce' : ''}`} />
                <span className="whitespace-nowrap">{isPulling ? t('pulling') : t('pullNow')}</span>
              </button>

              {/* Push button */}
              <button
                onClick={handlePush}
                disabled={isPushing || isPulling || isFetching || !project.isGit}
                className={`studio-btn h-8 px-3 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  (details?.status?.ahead || project.ahead || 0) > 0
                    ? 'border-sky-500/40 text-sky-600 dark:text-sky-300 hover:border-sky-500 bg-sky-500/5'
                    : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t('pushToRemote')}
              >
                <Upload className={`w-3.5 h-3.5 shrink-0 text-sky-500 ${isPushing ? 'animate-bounce' : ''}`} />
                <span className="whitespace-nowrap">{isPushing ? t('pushing') : t('push')}</span>
                {(details?.status?.ahead || project.ahead || 0) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-bold text-[10px]">
                    {details?.status?.ahead || project.ahead}
                  </span>
                )}
              </button>

              <button
                onClick={loadDetails}
                title="Refresh project details"
                className="studio-btn h-8 w-8 flex items-center justify-center text-slate-400 hover:text-sky-500 cursor-pointer p-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Details (Left) + Modifications (Right) */}
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-3 font-mono">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-xs font-semibold text-sky-500 tracking-wider">READING REPOSITORY STATE & DIFFS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* LEFT COLUMN: All Project Details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-1">
              {/* Git Overview Card */}
              <div className="studio-card p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-sky-500" />
                    <span>{t('gitStatusTitle')}</span>
                  </span>
                  {details?.status?.clean ? (
                    <span className="studio-pill bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs py-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('cleanBadge')}
                    </span>
                  ) : (
                    <span className="studio-pill bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs py-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {details?.status?.filesCount || 0} {t('modifiedBadge')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('branch')}</span>
                    <div className="mt-1">
                      <BranchSelector
                        currentBranch={details?.status?.branch || project.branch}
                        branches={details?.branches || project.branches}
                        projectPath={project.path}
                        onCheckout={handleCheckoutBranch}
                        size="sm"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('ahead')}</span>
                    <span className="text-xs font-mono font-bold text-sky-500 dark:text-sky-400 mt-1 inline-flex items-center gap-1">
                      <ArrowUp className="w-3.5 h-3.5" /> {details?.status?.ahead || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('behindMetric')}</span>
                    <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 mt-1 inline-flex items-center gap-1">
                      <ArrowDown className="w-3.5 h-3.5" /> {details?.status?.behind || 0}
                    </span>
                  </div>
                </div>

                {/* Upstream & Path */}
                <div className="text-xs flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t('upstream')}:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{details?.status?.tracking || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t('pathLabel')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[220px]" title={project.path}>
                      {project.path}
                    </span>
                  </div>
                </div>
              </div>

              {/* Laravel & Environment Specs */}
              {project.isLaravel && (
                <div className="studio-card p-5 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff2d20] via-rose-500 to-transparent opacity-80" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#ff2d20]" />
                    <span>{t('laravelSpecs')}</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('framework')}</span>
                      <span className="text-[#ff2d20] font-bold font-mono">
                        Laravel {project.laravelVersion ? project.laravelVersion.replace(/[\^~]/g, '') : 'Unknown'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('phpConstraint')}</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold font-mono">
                        {project.phpVersion || 'Any'}
                      </span>
                    </div>

                    {details?.envInfo?.appEnv && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('environment')}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          {details.envInfo.appEnv}
                        </span>
                      </div>
                    )}

                    {details?.envInfo?.dbConnection && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Database className="w-3 h-3 text-slate-400" /> {t('database')}
                        </span>
                        <span className="text-sky-600 dark:text-sky-400 font-bold uppercase">
                          {details.envInfo.dbConnection}
                        </span>
                      </div>
                    )}
                  </div>

                  {details?.composerInfo?.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] font-medium italic">
                      <p>{details.composerInfo.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tech Specs Card for JavaScript, TypeScript, Python, etc. */}
              {!project.isLaravel && project.projectType && project.projectType !== 'other' && (() => {
                const meta = getTechMeta(project.projectType);
                const Icon = meta.icon;
                return (
                  <div className="studio-card p-5 flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${meta.textColor}`} />
                      <span>{t('stackSpecs')}</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('framework')}</span>
                        <span className={`${meta.textColor} font-bold font-mono`}>
                          {project.framework || project.projectTypeLabel || meta.label}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Language</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold font-mono">
                          {project.language || meta.label}
                        </span>
                      </div>

                      {details?.packageInfo?.version && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Version</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            v{details.packageInfo.version}
                          </span>
                        </div>
                      )}

                      {details?.packageInfo?.dependenciesCount !== undefined && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Dependencies</span>
                          <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">
                            {details.packageInfo.dependenciesCount} packages
                          </span>
                        </div>
                      )}
                    </div>

                    {details?.packageInfo?.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] font-medium italic">
                        <p>{details.packageInfo.description}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Git Remotes Card with Set/Edit URL Capability */}
              {project.isGit && (
                <div className="studio-card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-500" />
                      <span>{t('remotesTitle')}</span>
                    </span>

                    {(!details?.remotes || details.remotes.length === 0) && !editingRemoteName && (
                      <button
                        onClick={() => startEditRemote('origin', '')}
                        className="studio-btn px-2.5 py-1 text-xs font-medium text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('addRemote')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {details?.remotes && details.remotes.length > 0 ? (
                      details.remotes.map((remote, idx) => {
                        const isEditing = editingRemoteName === remote.name;
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                {remote.name}
                              </span>

                              {!isEditing && (
                                <button
                                  onClick={() => startEditRemote(remote.name, remote.url)}
                                  title={t('editRemote')}
                                  className="studio-btn p-1 text-slate-400 hover:text-sky-500 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="flex flex-col gap-2 pt-1">
                                <input
                                  type="text"
                                  value={editingRemoteUrl}
                                  onChange={(e) => setEditingRemoteUrl(e.target.value)}
                                  placeholder={t('remoteUrlPlaceholder')}
                                  disabled={isSavingRemote}
                                  className="w-full bg-white dark:bg-[#0A0D14] border border-sky-500/60 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRemoteUrl(remote.name);
                                    if (e.key === 'Escape') cancelEditRemote();
                                  }}
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={cancelEditRemote}
                                    disabled={isSavingRemote}
                                    className="studio-btn px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                  >
                                    {t('cancelBtn')}
                                  </button>
                                  <button
                                    onClick={() => handleSaveRemoteUrl(remote.name)}
                                    disabled={isSavingRemote}
                                    className="studio-btn-primary px-3 py-1 text-xs cursor-pointer gap-1"
                                  >
                                    {isSavingRemote ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    <span>{t('saveRemote')}</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-mono text-[11px] break-all select-all bg-white dark:bg-black/30 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                                <span title={remote.url} className="truncate">
                                  {remote.url}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col gap-2 text-xs">
                        {editingRemoteName === 'origin' ? (
                          <div className="flex flex-col gap-2">
                            <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs">origin</span>
                            <input
                              type="text"
                              value={editingRemoteUrl}
                              onChange={(e) => setEditingRemoteUrl(e.target.value)}
                              placeholder={t('remoteUrlPlaceholder')}
                              disabled={isSavingRemote}
                              className="w-full bg-white dark:bg-[#0A0D14] border border-sky-500/60 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRemoteUrl('origin');
                                if (e.key === 'Escape') cancelEditRemote();
                              }}
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={cancelEditRemote}
                                disabled={isSavingRemote}
                                className="studio-btn px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                              >
                                {t('cancelBtn')}
                              </button>
                              <button
                                onClick={() => handleSaveRemoteUrl('origin')}
                                disabled={isSavingRemote}
                                className="studio-btn-primary px-3 py-1 text-xs cursor-pointer gap-1"
                              >
                                {isSavingRemote ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>{t('saveRemote')}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="italic">No remote configured yet</span>
                            <button
                              onClick={() => startEditRemote('origin', '')}
                              className="studio-btn px-2.5 py-1 text-xs text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{t('setRemoteUrl')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Commits Timeline */}
              {details?.recentCommits && details.recentCommits.length > 0 && (
                <div className="studio-card p-5 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span>{t('recentCommitsTitle')}</span>
                  </span>
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {details.recentCommits.map((commit, idx) => (
                      <div key={idx} className="py-2.5 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{commit.hash}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{commit.timeAgo}</span>
                        </div>
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate" title={commit.message}>
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
              <div className="studio-card p-5 flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      <span>{t('modificationsTitle')}</span>
                    </span>
                    <span className="studio-pill bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs py-0.5">
                      {details?.status?.filesCount || 0}
                    </span>
                  </div>

                  {details?.status && !details.status.clean && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenCommitModal}
                        disabled={isResetting || isCommittingAndPushing}
                        className="studio-btn-primary h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title={t('pushModifications')}
                      >
                        <Upload className={`w-3.5 h-3.5 ${isCommittingAndPushing ? 'animate-bounce' : ''}`} />
                        <span>{t('pushModifications')}</span>
                      </button>

                      <button
                        onClick={() => setShowResetModal(true)}
                        disabled={isResetting || isCommittingAndPushing}
                        className="studio-btn h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer"
                        title={t('resetAllChanges')}
                      >
                        <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                        <span>{t('resetAllChanges')}</span>
                      </button>

                      <div className="relative w-44">
                        <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <input
                          type="text"
                          value={fileSearch}
                          onChange={(e) => setFileSearch(e.target.value)}
                          placeholder={`${t('filterFilesPlaceholder')}...`}
                          className={`w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-sky-500/50 rounded-lg py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none font-medium ${
                            isRTL ? 'pr-8 pl-2' : 'pl-8 pr-2'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Body: Modified files or Clean state */}
                {details?.status?.clean ? (
                  /* Clean State (No modifications) */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('cleanTreeTitle')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md font-medium">
                      {t('cleanTreeDesc')}
                    </p>
                    {(details.status.ahead || 0) > 0 && (
                      <button
                        onClick={handlePush}
                        disabled={isPushing}
                        className="studio-btn-primary px-3 py-1.5 text-xs mt-2 cursor-pointer gap-1.5 flex items-center shadow-sm"
                      >
                        <Upload className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                        <span>{isPushing ? t('pushing') : `${t('push')} (${details.status.ahead} ${t('ahead')})`}</span>
                      </button>
                    )}
                    {details.status.tracking && (
                      <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                        {t('syncedWith')} <code className="text-sky-500 dark:text-sky-400 font-bold">{details.status.tracking}</code>
                      </span>
                    )}
                  </div>
                ) : (
                  /* Modifications Exist */
                  <div className="flex-1 flex flex-col gap-3.5 pt-3.5 overflow-hidden">
                    {/* Files list */}
                    <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.04] flex-shrink-0">
                      {filteredFiles.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No matching files.</div>
                      ) : (
                        filteredFiles.map((file, idx) => {
                          const isSelected = selectedFile?.path === file.path;
                          let badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                          if (file.type === 'untracked') badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
                          if (file.type === 'added') badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                          if (file.type === 'deleted') badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

                          return (
                            <div
                              key={idx}
                              onClick={() => loadFileDiff(file)}
                              className={`group w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                                isSelected ? 'bg-sky-500/10 border-l-2 border-sky-500 text-sky-600 dark:text-sky-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className={`studio-pill text-[10px] py-0.5 ${badgeClass}`}>
                                  {file.code || file.type}
                                </span>
                                <span className="truncate text-slate-700 dark:text-slate-200 font-medium" title={file.path}>
                                  {file.path}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDiscardFile(file.path);
                                  }}
                                  disabled={discardingFile === file.path}
                                  title={t('discardFile')}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  {discardingFile === file.path ? (
                                    <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                                {isRTL ? (
                                  <ChevronLeft className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-sky-500' : ''}`} />
                                ) : (
                                  <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-sky-500' : ''}`} />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Diff Viewer for selected file */}
                    <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-900 overflow-hidden min-h-[260px]">
                      <div className="px-4 py-2 bg-slate-950/80 border-b border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-slate-300 flex items-center gap-2 truncate font-medium">
                          <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span className="truncate font-mono">{selectedFile ? selectedFile.path : t('selectFileToInspect')}</span>
                        </span>
                        {selectedFile && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                              {selectedFile.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDiscardFile(selectedFile.path)}
                              disabled={discardingFile === selectedFile.path}
                              className="studio-btn h-6 px-2 text-[10px] text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1 cursor-pointer"
                              title={t('discardFile')}
                            >
                              {discardingFile === selectedFile.path ? (
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5" />
                              )}
                              <span>{t('discardFile')}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed select-text bg-[#0A0D14]" dir="ltr">
                        {diffLoading ? (
                          <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                            <span className="text-sky-400 font-semibold">Loading diff...</span>
                          </div>
                        ) : fileDiff ? (
                          fileDiff.split('\n').map((line, lIdx) => {
                            let lineClass = 'text-slate-300';
                            let bgClass = '';
                            if (line.startsWith('+') && !line.startsWith('+++')) {
                              lineClass = 'text-emerald-400 font-medium';
                              bgClass = 'bg-emerald-500/10';
                            } else if (line.startsWith('-') && !line.startsWith('---')) {
                              lineClass = 'text-rose-400 font-medium';
                              bgClass = 'bg-rose-500/10';
                            } else if (line.startsWith('@@')) {
                              lineClass = 'text-sky-400 font-semibold';
                              bgClass = 'bg-sky-500/10';
                            }

                            return (
                              <div key={lIdx} className={`${lineClass} ${bgClass} px-2 py-0.5 rounded whitespace-pre-wrap`}>
                                {line}
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                            {t('selectFileToInspect')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diff Stat Summary */}
                    {details?.status?.diffStat && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t('summaryStats')}
                        </span>
                        <pre className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-20" dir="ltr">
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="studio-card max-w-md w-full p-6 space-y-5 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/[0.1] shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('resetConfirmTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {t('resetConfirmDesc')}
                </p>
              </div>
            </div>

            {/* Checkbox for untracked files */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={includeUntracked}
                  onChange={(e) => setIncludeUntracked(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 border-slate-300 dark:border-white/[0.2] bg-white dark:bg-[#0A0D14] cursor-pointer"
                />
                <span>{t('resetIncludeUntracked')}</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="studio-btn px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t('cancelBtn')}
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm cursor-pointer flex items-center gap-2 transition-all active:scale-95"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('resettingChanges')}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('confirmResetBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Commit & Push Confirmation Modal */}
      {showCommitPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="studio-card max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/[0.1] shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('commitAndPushTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {details?.status?.filesCount || 0} modified file{(details?.status?.filesCount || 0) === 1 ? '' : 's'} will be staged, committed, and pushed to remote branch <span className="font-mono text-sky-500 font-semibold">{details?.status?.branch || project.branch}</span>.
                </p>
              </div>
            </div>

            {/* Commit Message Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Commit Message
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCommitMessage}
                  disabled={isCommittingAndPushing}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-all cursor-pointer select-none active:scale-95"
                  title={t('autoGenerateMsg')}
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span>{t('autoGenerateMsg')}</span>
                </button>
              </div>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={t('commitMsgPlaceholder')}
                disabled={isCommittingAndPushing}
                rows={3}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-sky-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none font-mono"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleCommitAndPush();
                  }
                }}
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Tip: Press <kbd className="font-mono bg-slate-100 dark:bg-white/[0.06] px-1 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">Cmd+Enter</kbd> to commit & push.</span>
                <span className="font-mono">{commitMessage.length} chars</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCommitPushModal(false)}
                disabled={isCommittingAndPushing}
                className="studio-btn px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t('cancelBtn')}
              </button>
              <button
                type="button"
                onClick={handleCommitAndPush}
                disabled={isCommittingAndPushing}
                className="studio-btn-primary px-4 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all active:scale-95"
              >
                {isCommittingAndPushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('committingAndPushing')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('commitAndPushBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
