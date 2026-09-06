import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectListItem } from './components/ProjectListItem';
import { ProjectDetailsPage } from './components/ProjectDetailsPage';
import { ManageFoldersPage } from './components/ManageFoldersPage';
import { StatusModal } from './components/StatusModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsPage } from './components/SettingsPage';
import { BadgesPage } from './components/BadgesPage';
import { ProjectItem, AppSettings, FilterCategory, ViewMode } from './types';
import { useLanguage } from './context/LanguageContext';
import { FolderX, FolderPlus, Settings2, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const App: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    projectsPaths: [],
    projectsPath: '',
    editor: 'code',
    theme: 'dark',
  });

  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | null>(null);
  const [selectedProjectForPage, setSelectedProjectForPage] = useState<ProjectItem | null>(null);
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);
  const [isSettingsPageOpen, setIsSettingsPageOpen] = useState(false);
  const [isBadgesPageOpen, setIsBadgesPageOpen] = useState(false);

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
  const [pullingIds, setPullingIds] = useState<Set<string>>(new Set());
  const [isBulkFetching, setIsBulkFetching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isBulkPulling, setIsBulkPulling] = useState(false);
  const [bulkPullProgress, setBulkPullProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Theme management: synchronize .light and .dark classes on root HTML
  useEffect(() => {
    const isLight = settings.theme === 'light';
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleSaveSettings({ theme: nextTheme });
  };

  // Initial load
  useEffect(() => {
    loadSettingsAndProjects();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const sendDesktopNotification = (title: string, body: string) => {
    const notifSettings = settings.notificationSettings;
    const isEnabled = notifSettings?.enabled ?? settings.notifications ?? true;
    if (!isEnabled) return;
    const sound = notifSettings?.sound ?? true;

    try {
      const api = window.gityAPI || window.api;
      if (api?.showNotification) {
        api.showNotification(title, body, sound);
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, silent: !sound });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title, { body, silent: !sound });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to send desktop notification:', e);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (statusModalProject) {
          setStatusModalProject(null);
        } else if (isSettingsPageOpen) {
          setIsSettingsPageOpen(false);
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
        setSelectedProjectForPage(null);
        setIsManageFoldersOpen(false);
        setIsSettingsPageOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.projectsPaths, statusModalProject, isSettingsOpen, isSettingsPageOpen, isManageFoldersOpen, selectedProjectForPage]);

  const loadSettingsAndProjects = async () => {
    try {
      const api = window.gityAPI || window.api;
      let pathsToScan: string[] = settings.projectsPaths || [];
      if (api?.getSettings) {
        const loaded = await api.getSettings();
        setSettings(loaded);
        pathsToScan = loaded.projectsPaths?.length ? loaded.projectsPaths : (loaded.projectsPath ? [loaded.projectsPath] : []);
      }
      await scanProjects(pathsToScan);
    } catch {
      setProjects([]);
      setError(null);
      setLoading(false);
    }
  };

  const scanProjects = async (folderPaths?: string | string[]) => {
    setLoading(true);
    setError(null);
    try {
      const api = window.gityAPI || window.api;
      if (api?.scanProjects) {
        const target = folderPaths !== undefined ? folderPaths : (settings.projectsPaths?.length ? settings.projectsPaths : []);
        const list = await api.scanProjects(target);
        setProjects(Array.isArray(list) ? list : []);
      }
    } catch {
      // Do not throw error or show error screen if directory does not exist - render no-content state
      setProjects([]);
      setError(null);
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

  const handlePullProject = async (projectPath: string, projectId: string) => {
    if (pullingIds.has(projectId)) return;

    setPullingIds(prev => new Set(prev).add(projectId));
    try {
      const api = window.gityAPI || window.api;
      if (api?.pullProject) {
        const res = await api.pullProject(projectPath);
        setProjects(prev =>
          prev.map(p => {
            if ((p.id === projectId || p.path === projectPath) && res.summary) {
              return { ...p, ...res.summary };
            }
            return p;
          })
        );
        if (selectedProjectForPage && (selectedProjectForPage.id === projectId || selectedProjectForPage.path === projectPath) && res.summary) {
          setSelectedProjectForPage(prev => (prev ? { ...prev, ...res.summary } : null));
        }

        if (res.success) {
          showToast(`[${projectId}] Pulled successfully in ${res.duration}`, 'success');
        } else {
          showToast(`[${projectId}] ${res.message}`, 'error');
        }
      }
    } catch (err: any) {
      showToast(`[${projectId}] Pull error: ${err.message}`, 'error');
    } finally {
      setPullingIds(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const handleCheckoutBranch = async (projectPath: string, branchName: string, projectId: string) => {
    try {
      const api = window.gityAPI || window.api;
      if (!api?.checkoutBranch) return;

      const res = await api.checkoutBranch(projectPath, branchName);
      if (res.success) {
        setProjects(prev =>
          prev.map(p => {
            if (p.path === projectPath || p.id === projectId) {
              return {
                ...p,
                branch: res.branch,
                ...(res.summary || {}),
              };
            }
            return p;
          })
        );
        if (selectedProjectForPage && (selectedProjectForPage.path === projectPath || selectedProjectForPage.id === projectId)) {
          setSelectedProjectForPage(prev => prev ? {
            ...prev,
            branch: res.branch,
            ...(res.summary || {}),
          } : null);
        }
        showToast(t('branchSwitched', { branch: res.branch }), 'success');
      } else {
        showToast(res.message || t('branchCheckoutFailed', { error: branchName }), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    }
  };

  const handleResetChanges = async (
    projectPath: string, 
    projectId: string, 
    options?: { filePath?: string; includeUntracked?: boolean }
  ) => {
    try {
      const api = window.gityAPI || window.api;
      if (!api?.resetChanges) return;

      const res = await api.resetChanges(projectPath, options);
      if (res.success) {
        setProjects(prev =>
          prev.map(p => {
            if (p.path === projectPath || p.id === projectId) {
              return {
                ...p,
                ...(res.summary || {}),
              };
            }
            return p;
          })
        );
        if (selectedProjectForPage && (selectedProjectForPage.path === projectPath || selectedProjectForPage.id === projectId)) {
          setSelectedProjectForPage(prev => prev ? {
            ...prev,
            ...(res.summary || {}),
          } : null);
        }
        showToast(res.message || t('resetSuccess'), 'success');
        return res;
      } else {
        showToast(res.message || 'Failed to reset changes', 'error');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset changes', 'error');
    }
  };

  const handleBulkFetch = async () => {
    const gitProjects = filteredProjects.filter(p => p.isGit);
    if (gitProjects.length === 0 || isBulkFetching) return;

    setIsBulkFetching(true);
    setBulkProgress({ current: 0, total: gitProjects.length });

    const api = window.gityAPI || window.api;
    let completed = 0;
    let successCount = 0;
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
          if (res.success) {
            successCount++;
          } else {
            failedCount++;
          }
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
    const fetchToastType = failedCount === 0 ? 'success' : (successCount === 0 ? 'error' : 'info');
    const msg = t('fetchAllResult', { success: successCount, failed: failedCount });
    showToast(msg, fetchToastType);
    if (settings.notificationSettings?.fetchAlerts !== false) {
      sendDesktopNotification(t('fetchAll'), msg);
    }
  };

  const handleBulkPull = async () => {
    const gitProjects = filteredProjects.filter(p => p.isGit);
    if (gitProjects.length === 0 || isBulkPulling) return;

    setIsBulkPulling(true);
    setBulkPullProgress({ current: 0, total: gitProjects.length });

    const api = window.gityAPI || window.api;
    let completed = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const proj of gitProjects) {
      setPullingIds(prev => new Set(prev).add(proj.id));
      try {
        if (api?.pullProject) {
          const res = await api.pullProject(proj.path);
          if (res.summary) {
            setProjects(prev =>
              prev.map(p => (p.id === proj.id ? { ...p, ...res.summary } : p))
            );
          }
          if (res.success) {
            successCount++;
          } else {
            failedCount++;
          }
        }
      } catch (e) {
        failedCount++;
        console.warn(`Pull error on ${proj.id}:`, e);
      } finally {
        setPullingIds(prev => {
          const next = new Set(prev);
          next.delete(proj.id);
          return next;
        });
        completed++;
        setBulkPullProgress({ current: completed, total: gitProjects.length });
      }
    }

    setIsBulkPulling(false);
    const pullToastType = failedCount === 0 ? 'success' : (successCount === 0 ? 'error' : 'info');
    const msg = t('pullAllResult', { success: successCount, failed: failedCount });
    showToast(msg, pullToastType);
    if (settings.notificationSettings?.pullAlerts !== false) {
      sendDesktopNotification(t('pullAll'), msg);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const api = window.gityAPI || window.api;
    if (api?.saveSettings) {
      const updated = await api.saveSettings(newSettings);
      setSettings(updated);
      if (newSettings.projectsPaths || newSettings.projectsPath) {
        await scanProjects(updated.projectsPaths);
      }
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
    const types: Record<string, number> = {};
    scopedProjects.forEach(p => {
      const t = p.projectType || (p.isLaravel ? 'laravel' : 'other');
      types[t] = (types[t] || 0) + 1;
    });

    const jsCount = (types['javascript'] || 0) + (types['typescript'] || 0);
    const pyCount = types['python'] || 0;
    const laravelCount = scopedProjects.filter(p => p.isLaravel || p.projectType === 'laravel').length;

    return {
      all: scopedProjects.length,
      laravel: laravelCount,
      javascript: jsCount,
      python: pyCount,
      modified: scopedProjects.filter(p => p.isGit && !p.clean).length,
      behind: scopedProjects.filter(p => p.isGit && p.behind > 0).length,
      clean: scopedProjects.filter(p => p.isGit && p.clean).length,
      types,
    };
  }, [scopedProjects]);

  const filteredProjects = useMemo(() => {
    let list = scopedProjects;
    if (activeFilter === 'laravel') {
      list = list.filter(p => p.isLaravel || p.projectType === 'laravel');
    } else if (activeFilter === 'javascript') {
      list = list.filter(p => p.projectType === 'javascript' || p.projectType === 'typescript');
    } else if (activeFilter === 'python') {
      list = list.filter(p => p.projectType === 'python');
    } else if (activeFilter === 'modified') {
      list = list.filter(p => p.isGit && !p.clean);
    } else if (activeFilter === 'behind') {
      list = list.filter(p => p.isGit && p.behind > 0);
    } else if (activeFilter === 'clean') {
      list = list.filter(p => p.isGit && p.clean);
    } else if (activeFilter !== 'all') {
      list = list.filter(p => p.projectType === activeFilter);
    }

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
      : settings.projectsPath || (settings.projectsPaths?.[0] || 'No folder selected'));

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] dark:bg-[#0a0d14] text-slate-800 dark:text-slate-100 select-none overflow-hidden font-sans">
      {/* macOS Sidebar */}
      <Sidebar
        currentCategory={activeFilter}
        onSelectCategory={(category) => {
          setIsManageFoldersOpen(false);
          setIsSettingsPageOpen(false);
          setIsBadgesPageOpen(false);
          setSelectedProjectForPage(null);
          setActiveFilter(category);
        }}
        folders={settings.projectsPaths || []}
        selectedFolder={selectedFolderFilter}
        onSelectFolder={(f) => {
          setIsManageFoldersOpen(false);
          setIsSettingsPageOpen(false);
          setIsBadgesPageOpen(false);
          setSelectedProjectForPage(null);
          setSelectedFolderFilter(f);
        }}
        onAddFolder={handleAddFolderQuick}
        onOpenManageFolders={() => {
          setSelectedProjectForPage(null);
          setIsSettingsPageOpen(false);
          setIsBadgesPageOpen(false);
          setIsManageFoldersOpen(true);
        }}
        isManagingFolders={isManageFoldersOpen}
        isSettingsOpen={isSettingsPageOpen}
        onOpenSettings={() => {
          setSelectedProjectForPage(null);
          setIsManageFoldersOpen(false);
          setIsBadgesPageOpen(false);
          setIsSettingsPageOpen(true);
        }}
        isBadgesOpen={isBadgesPageOpen}
        onOpenBadges={() => {
          setSelectedProjectForPage(null);
          setIsManageFoldersOpen(false);
          setIsSettingsPageOpen(false);
          setIsBadgesPageOpen(true);
        }}
        onRefresh={() => scanProjects(settings.projectsPaths)}
        counts={counts}
        folderCounts={folderCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] dark:bg-[#0a0d14]">
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
        ) : isSettingsPageOpen ? (
          <SettingsPage
            currentSettings={settings}
            projects={projects}
            onBack={() => setIsSettingsPageOpen(false)}
            onSave={handleSaveSettings}
            onOpenManageFolders={() => {
              setIsSettingsPageOpen(false);
              setIsManageFoldersOpen(true);
            }}
            onShowToast={showToast}
          />
        ) : isBadgesPageOpen ? (
          <BadgesPage
            projects={projects}
            onBack={() => setIsBadgesPageOpen(false)}
            onSelectProject={(project) => {
              setIsBadgesPageOpen(false);
              setSelectedProjectForPage(project);
            }}
            onFilterByBadge={(badgeKey) => {
              setIsBadgesPageOpen(false);
              setActiveFilter(badgeKey as FilterCategory);
            }}
          />
        ) : selectedProjectForPage ? (
          <ProjectDetailsPage
            project={selectedProjectForPage}
            onBack={() => setSelectedProjectForPage(null)}
            onOpenFolder={handleOpenLocation}
            onFetchRemote={handleFetchRemote}
            onPullProject={handlePullProject}
            isPulling={pullingIds.has(selectedProjectForPage.id)}
            onCheckoutBranch={handleCheckoutBranch}
            onResetChanges={handleResetChanges}
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
              onPullAll={handleBulkPull}
              onOpenSettings={() => {
                setSelectedProjectForPage(null);
                setIsManageFoldersOpen(false);
                setIsSettingsPageOpen(true);
              }}
              isBulkFetching={isBulkFetching}
              bulkProgress={bulkProgress}
              isBulkPulling={isBulkPulling}
              bulkPullProgress={bulkPullProgress}
              counts={counts}
              currentTheme={settings.theme || 'dark'}
              onToggleTheme={handleToggleTheme}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
                  <p className="text-xs font-semibold text-sky-500">{t('scanningText')} <code className="text-sky-500 font-mono">{currentHeaderPath}</code>...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[380px] text-center p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-sky-500 mb-4 shadow-sm">
                    <FolderPlus className="w-7 h-7" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    {t('noProjectsFound')}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mb-5">
                    {searchQuery || activeFilter !== 'all' || selectedFolderFilter
                      ? `${t('noProjectsMatching')} "${searchQuery || activeFilter}".`
                      : `The monitored workspace directory does not exist or contains no repositories yet.`}
                  </p>

                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={handleAddFolderQuick}
                      className="studio-btn-primary px-4 py-2 text-xs cursor-pointer gap-2"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>{t('addFolder')}</span>
                    </button>

                    <button
                      onClick={() => setIsManageFoldersOpen(true)}
                      className="studio-btn px-4 py-2 text-xs cursor-pointer gap-2"
                    >
                      <Settings2 className="w-4 h-4 text-sky-500" />
                      <span>{t('manageFolders')}</span>
                    </button>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isFetching={fetchingIds.has(project.id)}
                      isPulling={pullingIds.has(project.id)}
                      onOpenLocation={handleOpenLocation}
                      onFetchRemote={handleFetchRemote}
                      onPullProject={handlePullProject}
                      onOpenStatus={(p) => setStatusModalProject(p)}
                      onSelectProject={(p) => setSelectedProjectForPage(p)}
                      onCheckoutBranch={handleCheckoutBranch}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Grid Header aligned with ProjectListItem columns */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 md:gap-4 items-center px-4 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] select-none">
                    <div className="col-span-1 md:col-span-4 lg:col-span-3 xl:col-span-3 truncate">{t('projectCol')}</div>
                    <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 truncate">{t('branch')}</div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 truncate">{t('status')}</div>
                    <div className="hidden lg:block lg:col-span-3 xl:col-span-3 truncate pr-4 rtl:pr-0 rtl:pl-4">{t('latestCommitCol')}</div>
                    <div className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 text-start md:text-end truncate">{t('actionsCol')}</div>
                  </div>
                  {filteredProjects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      isFetching={fetchingIds.has(project.id)}
                      isPulling={pullingIds.has(project.id)}
                      onOpenLocation={handleOpenLocation}
                      onFetchRemote={handleFetchRemote}
                      onPullProject={handlePullProject}
                      onOpenStatus={(p) => setStatusModalProject(p)}
                      onSelectProject={(p) => setSelectedProjectForPage(p)}
                      onCheckoutBranch={handleCheckoutBranch}
                    />
                  ))}
                </div>
              )}
            </main>

            {/* Bottom Statusbar */}
            <footer className="no-drag h-8 px-6 bg-white/70 dark:bg-[#0e131f]/70 backdrop-blur-md border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none flex-shrink-0">
              <div className="flex items-center gap-3">
                <span>{projects.length} {t('projects')}</span>
                {counts.laravel > 0 && (
                  <>
                    <span className="opacity-30">•</span>
                    <span className="text-[#ff2d20] font-semibold">{counts.laravel} Laravel</span>
                  </>
                )}
                {counts.javascript > 0 && (
                  <>
                    <span className="opacity-30">•</span>
                    <span className="text-amber-500 font-semibold">{counts.javascript} JS/TS</span>
                  </>
                )}
                {counts.python > 0 && (
                  <>
                    <span className="opacity-30">•</span>
                    <span className="text-emerald-500 font-semibold">{counts.python} Python</span>
                  </>
                )}
                <span className="opacity-30">•</span>
                <span className="text-sky-500 font-semibold">{projects.filter(p => p.isGit).length} {t('gitRepos')}</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                Gity Studio v1.0
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
        <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2.5 bg-slate-900/95 dark:bg-[#131929]/95 backdrop-blur-xl border border-slate-700/80 dark:border-white/[0.12] rounded-xl px-4 py-2.5 shadow-xl text-xs font-semibold text-white animate-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#ff2d20]" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
