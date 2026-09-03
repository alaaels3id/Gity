import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectListItem } from './components/ProjectListItem';
import { ProjectDetailsPage } from './components/ProjectDetailsPage';
import { ManageFoldersPage } from './components/ManageFoldersPage';
import { StatusModal } from './components/StatusModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectItem, AppSettings, FilterCategory, ViewMode } from './types';
import { useLanguage } from './context/LanguageContext';
import { FolderX, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const App: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    projectsPaths: ['/Users/alaaelsaid/code'],
    projectsPath: '/Users/alaaelsaid/code',
    editor: 'code',
    theme: 'dark',
  });

  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | null>(null);
  const [selectedProjectForPage, setSelectedProjectForPage] = useState<ProjectItem | null>(null);
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('gity_view_mode') as ViewMode) || 'grid';
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('gity_view_mode', mode);
  };

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusModalProject, setStatusModalProject] = useState<ProjectItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fetchingIds, setFetchingIds] = useState<Set<string>>(new Set());
  const [isBulkFetching, setIsBulkFetching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadSettingsAndProjects();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (statusModalProject) {
          setStatusModalProject(null);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isManageFoldersOpen) {
          setIsManageFoldersOpen(false);
        } else if (selectedProjectForPage) {
          setSelectedProjectForPage(null);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        scanProjects(settings.projectsPaths);
      } else if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.projectsPaths, statusModalProject, isSettingsOpen, isManageFoldersOpen, selectedProjectForPage]);

  const loadSettingsAndProjects = async () => {
    try {
      const api = window.gityAPI || window.api;
      let pathsToScan: string[] = settings.projectsPaths || ['/Users/alaaelsaid/code'];
      if (api?.getSettings) {
        const loaded = await api.getSettings();
        setSettings(loaded);
        pathsToScan = loaded.projectsPaths?.length ? loaded.projectsPaths : [loaded.projectsPath || '/Users/alaaelsaid/code'];
      }
      await scanProjects(pathsToScan);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize');
      setLoading(false);
    }
  };

  const scanProjects = async (folderPaths?: string | string[]) => {
    setLoading(true);
    setError(null);
    try {
      const api = window.gityAPI || window.api;
      if (api?.scanProjects) {
        const target = folderPaths || (settings.projectsPaths?.length ? settings.projectsPaths : ['/Users/alaaelsaid/code']);
        const list = await api.scanProjects(target);
        setProjects(list);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan projects');
      showToast(err.message || 'Scan error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolderQuick = async () => {
    const api = window.gityAPI || window.api;
    if (api?.selectFolder) {
      try {
        const selected = await api.selectFolder();
        if (selected) {
          const trimmed = selected.trim();
          const currentPaths = settings.projectsPaths || [];
          if (currentPaths.includes(trimmed)) {
            showToast(t('folderAlreadyAdded'), 'info');
            return;
          }
          const updatedPaths = [...currentPaths, trimmed];
          const updatedSettings = await api.saveSettings({
            projectsPaths: updatedPaths,
            projectsPath: updatedPaths[0],
          });
          setSettings(updatedSettings);
          await scanProjects(updatedPaths);
          showToast(`Added folder: ${trimmed}`, 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to add folder', 'error');
      }
    }
  };

  // Primary Actions
  const handleOpenLocation = async (projectPath: string) => {
    try {
      const api = window.gityAPI || window.api;
      if (api?.openLocation) {
        await api.openLocation(projectPath);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to open directory', 'error');
    }
  };

  const handleFetchRemote = async (projectPath: string, projectId: string) => {
    if (fetchingIds.has(projectId)) return;

    setFetchingIds(prev => new Set(prev).add(projectId));
    try {
      const api = window.gityAPI || window.api;
      if (api?.fetchRemote) {
        const res = await api.fetchRemote(projectPath);
        setProjects(prev =>
          prev.map(p => (p.id === projectId && res.summary ? { ...p, ...res.summary } : p))
        );
        if (res.success) {
          showToast(`[${projectId}] Fetched in ${res.duration}`, 'success');
        } else {
          showToast(`[${projectId}] ${res.message}`, 'error');
        }
      }
    } catch (err: any) {
      showToast(`[${projectId}] Fetch error: ${err.message}`, 'error');
    } finally {
      setFetchingIds(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const handleBulkFetch = async () => {
    const gitProjects = filteredProjects.filter(p => p.isGit);
    if (gitProjects.length === 0 || isBulkFetching) return;

    setIsBulkFetching(true);
    setBulkProgress({ current: 0, total: gitProjects.length });

    const api = window.gityAPI || window.api;
    let completed = 0;
    let failedCount = 0;

    for (const proj of gitProjects) {
      setFetchingIds(prev => new Set(prev).add(proj.id));
      try {
        if (api?.fetchRemote) {
          const res = await api.fetchRemote(proj.path);
          if (res.summary) {
            setProjects(prev =>
              prev.map(p => (p.id === proj.id ? { ...p, ...res.summary } : p))
            );
          }
          if (!res.success) failedCount++;
        }
      } catch (e) {
        failedCount++;
        console.warn(`Fetch error on ${proj.id}:`, e);
      } finally {
        setFetchingIds(prev => {
          const next = new Set(prev);
          next.delete(proj.id);
          return next;
        });
        completed++;
        setBulkProgress({ current: completed, total: gitProjects.length });
      }
    }

    setIsBulkFetching(false);
    if (failedCount > 0) {
      showToast(`Fetched ${gitProjects.length - failedCount}/${gitProjects.length} repos (${failedCount} failed auth/network)`, 'info');
    } else {
      showToast(`Finished fetching all ${gitProjects.length} Git repositories!`, 'success');
    }
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const api = window.gityAPI || window.api;
    if (api?.saveSettings) {
      const updated = await api.saveSettings(newSettings);
      setSettings(updated);
      await scanProjects(updated.projectsPaths);
      showToast('Settings saved successfully', 'success');
    }
  };

  const handleRemoveFolder = async (folderPath: string) => {
    if ((settings.projectsPaths || []).length <= 1) {
      showToast(t('atLeastOneFolder'), 'error');
      return;
    }
    const updated = (settings.projectsPaths || []).filter(f => f !== folderPath);
    const api = window.gityAPI || window.api;
    if (api?.saveSettings) {
      const updatedSettings = await api.saveSettings({
        projectsPaths: updated,
        projectsPath: updated[0],
      });
      setSettings(updatedSettings);
      if (selectedFolderFilter === folderPath) {
        setSelectedFolderFilter(null);
      }
      await scanProjects(updated);
      showToast(`Removed folder: ${folderPath}`, 'info');
    }
  };

  // Counts per folder
  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (settings.projectsPaths || []).forEach(p => { map[p] = 0; });
    projects.forEach(p => {
      if (p.rootPath) {
        map[p.rootPath] = (map[p.rootPath] || 0) + 1;
      }
    });
    return map;
  }, [projects, settings.projectsPaths]);

  // Counts per category (scoped to selectedFolderFilter if set)
  const scopedProjects = useMemo(() => {
    if (!selectedFolderFilter) return projects;
    return projects.filter(p => p.rootPath === selectedFolderFilter);
  }, [projects, selectedFolderFilter]);

  const counts = useMemo(() => {
    return {
      all: scopedProjects.length,
      laravel: scopedProjects.filter(p => p.isLaravel).length,
      modified: scopedProjects.filter(p => p.isGit && !p.clean).length,
      behind: scopedProjects.filter(p => p.isGit && p.behind > 0).length,
      clean: scopedProjects.filter(p => p.isGit && p.clean).length,
    };
  }, [scopedProjects]);

  const filteredProjects = useMemo(() => {
    let list = scopedProjects;
    if (activeFilter === 'laravel') list = list.filter(p => p.isLaravel);
    else if (activeFilter === 'modified') list = list.filter(p => p.isGit && !p.clean);
    else if (activeFilter === 'behind') list = list.filter(p => p.isGit && p.behind > 0);
    else if (activeFilter === 'clean') list = list.filter(p => p.isGit && p.clean);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.rootFolderName && p.rootFolderName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [scopedProjects, activeFilter, searchQuery]);

  // Display name for header
  const currentHeaderPath = selectedFolderFilter
    ? selectedFolderFilter
    : (settings.projectsPaths?.length > 1
      ? `${settings.projectsPaths.length} Folders`
      : settings.projectsPath || '/Users/alaaelsaid/code');

  return (
    <div className="flex h-screen w-screen bg-[#090d16] text-slate-100 select-none overflow-hidden font-sans">
      {/* macOS Sidebar */}
      <Sidebar
        currentCategory={activeFilter}
        onSelectCategory={(category) => {
          setIsManageFoldersOpen(false);
          setSelectedProjectForPage(null);
          setActiveFilter(category);
        }}
        folders={settings.projectsPaths || []}
        selectedFolder={selectedFolderFilter}
        onSelectFolder={(f) => {
          setIsManageFoldersOpen(false);
          setSelectedProjectForPage(null);
          setSelectedFolderFilter(f);
        }}
        onAddFolder={handleAddFolderQuick}
        onOpenManageFolders={() => {
          setSelectedProjectForPage(null);
          setIsManageFoldersOpen(true);
        }}
        isManagingFolders={isManageFoldersOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => scanProjects(settings.projectsPaths)}
        onFetchAll={handleBulkFetch}
        isBulkFetching={isBulkFetching}
        bulkProgress={bulkProgress}
        counts={counts}
        folderCounts={folderCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isManageFoldersOpen ? (
          <ManageFoldersPage
            folders={settings.projectsPaths || []}
            projects={projects}
            onBack={() => setIsManageFoldersOpen(false)}
            onAddFolder={handleAddFolderQuick}
            onRemoveFolder={handleRemoveFolder}
            onRescan={() => scanProjects(settings.projectsPaths)}
            onOpenLocation={handleOpenLocation}
            onShowToast={showToast}
          />
        ) : selectedProjectForPage ? (
          <ProjectDetailsPage
            project={selectedProjectForPage}
            onBack={() => setSelectedProjectForPage(null)}
            onOpenFolder={handleOpenLocation}
            onFetchRemote={handleFetchRemote}
            onShowToast={showToast}
            editor={settings.editor}
          />
        ) : (
          <>
            {/* Top Header */}
            <Header
              currentPath={currentHeaderPath}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onRefresh={() => scanProjects(settings.projectsPaths)}
              onFetchAll={handleBulkFetch}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isBulkFetching={isBulkFetching}
              bulkProgress={bulkProgress}
              counts={counts}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-xs">{t('scanningText')} <code className="text-slate-300 font-mono">{currentHeaderPath}</code>...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-80 text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <FolderX className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">{t('couldNotScan')}</h3>
                  <p className="text-xs text-slate-400 max-w-sm">{error}</p>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                  >
                    {t('configureDirectory')}
                  </button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <FolderX className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">{t('noProjectsFound')}</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {searchQuery || activeFilter !== 'all' || selectedFolderFilter
                      ? `${t('noProjectsMatching')} "${searchQuery || activeFilter}".`
                      : `No project folders found.`}
                  </p>
                  <button
                    onClick={() => setIsManageFoldersOpen(true)}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                  >
                    {t('manageFolders')}
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isFetching={fetchingIds.has(project.id)}
                      onOpenLocation={handleOpenLocation}
                      onFetchRemote={handleFetchRemote}
                      onOpenStatus={(p) => setStatusModalProject(p)}
                      onSelectProject={(p) => setSelectedProjectForPage(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Grid Header aligned with ProjectListItem columns */}
                  <div className="hidden md:grid md:grid-cols-12 gap-2.5 md:gap-4 items-center px-4 py-2.5 text-xs font-semibold text-slate-400 border-b border-white/10 select-none">
                    <div className="col-span-1 md:col-span-4 lg:col-span-3 xl:col-span-3 truncate">{t('projectCol')}</div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 truncate">{t('branch')}</div>
                    <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 truncate">{t('status')}</div>
                    <div className="hidden lg:block lg:col-span-3 xl:col-span-3 truncate pr-4 rtl:pr-0 rtl:pl-4">{t('latestCommitCol')}</div>
                    <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 text-start md:text-end truncate">{t('actionsCol')}</div>
                  </div>
                  {filteredProjects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      isFetching={fetchingIds.has(project.id)}
                      onOpenLocation={handleOpenLocation}
                      onFetchRemote={handleFetchRemote}
                      onOpenStatus={(p) => setStatusModalProject(p)}
                      onSelectProject={(p) => setSelectedProjectForPage(p)}
                    />
                  ))}
                </div>
              )}
            </main>

            {/* Footer / Status Bar */}
            <footer className="h-8 bg-[#0a0f1a] border-t border-white/10 px-6 flex items-center justify-between text-[11px] text-slate-400 z-10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span>{projects.length} {t('totalProjects')}</span>
                <span className="opacity-30">•</span>
                <span>{projects.filter(p => p.isLaravel).length} {t('laravelProjects')}</span>
                <span className="opacity-30">•</span>
                <span>{projects.filter(p => p.isGit).length} {t('gitRepos')}</span>
              </div>
              <div className="text-slate-400 font-medium">
                {t('macWorkspace')}
              </div>
            </footer>
          </>
        )}
      </div>

      {/* Modals */}
      <StatusModal
        project={statusModalProject}
        onClose={() => setStatusModalProject(null)}
        onOpenFolder={handleOpenLocation}
        onFetchRemote={handleFetchRemote}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        currentSettings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
