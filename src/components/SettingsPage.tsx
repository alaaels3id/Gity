import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Settings as SettingsIcon, 
  Folder, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  Languages, 
  Code, 
  ExternalLink,
  Copy,
  AlertCircle,
  Command,
  Gamepad2,
  HardDrive,
  Sun,
  Moon,
  Bell,
  Volume2,
  Send
} from 'lucide-react';
import { AppSettings, ProjectItem, NotificationConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SettingsPageProps {
  currentSettings: AppSettings;
  projects?: ProjectItem[];
  onBack: () => void;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
  onOpenManageFolders?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentSettings,
  projects = [],
  onBack,
  onSave,
  onOpenManageFolders,
  onShowToast,
}) => {
  const { t, isRTL, language, setLanguage } = useLanguage();

  const [folders, setFolders] = useState<string[]>(() => {
    if (currentSettings.projectsPaths && currentSettings.projectsPaths.length > 0) {
      return [...currentSettings.projectsPaths];
    }
    if (currentSettings.projectsPath) {
      return [currentSettings.projectsPath];
    }
    return [];
  });

  const [editor, setEditor] = useState(currentSettings.editor || 'code');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(language);
  const [theme, setTheme] = useState<'dark' | 'light'>(currentSettings.theme || 'dark');
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(() => ({
    enabled: currentSettings.notificationSettings?.enabled ?? (currentSettings.notifications ?? true),
    sound: currentSettings.notificationSettings?.sound ?? true,
    fetchAlerts: currentSettings.notificationSettings?.fetchAlerts ?? true,
    pullAlerts: currentSettings.notificationSettings?.pullAlerts ?? true,
    modifiedAlerts: currentSettings.notificationSettings?.modifiedAlerts ?? true,
    modifiedThreshold: currentSettings.notificationSettings?.modifiedThreshold ?? 100,
    behindAlerts: currentSettings.notificationSettings?.behindAlerts ?? true,
    behindThreshold: currentSettings.notificationSettings?.behindThreshold ?? 90,
  }));
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Sync settings if updated externally
  useEffect(() => {
    if (currentSettings.projectsPaths?.length) {
      setFolders([...currentSettings.projectsPaths]);
    }
    if (currentSettings.editor) {
      setEditor(currentSettings.editor);
    }
    if (currentSettings.theme) {
      setTheme(currentSettings.theme);
    }
    if (currentSettings.notificationSettings) {
      setNotificationConfig(currentSettings.notificationSettings);
    } else if (currentSettings.notifications !== undefined) {
      setNotificationConfig(prev => ({ ...prev, enabled: currentSettings.notifications! }));
    }
  }, [currentSettings]);

  const handleAddFolder = async () => {
    try {
      const api = window.gityAPI || window.api;
      if (api?.selectFolder) {
        const selected = await api.selectFolder();
        if (selected) {
          const trimmed = selected.trim();
          if (folders.includes(trimmed)) {
            onShowToast?.(t('folderAlreadyAdded'), 'info');
            return;
          }
          setFolders(prev => [...prev, trimmed]);
          onShowToast?.(`Added folder: ${trimmed}`, 'success');
        }
      }
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to select folder', 'error');
    }
  };

  const handleRemoveFolder = (folderToRemove: string) => {
    if (folders.length <= 1) {
      onShowToast?.(t('atLeastOneFolder'), 'error');
      return;
    }
    setFolders(prev => prev.filter(f => f !== folderToRemove));
    onShowToast?.(`Removed folder: ${folderToRemove}`, 'info');
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    onShowToast?.(t('pathCopied'), 'success');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleResetDefaults = () => {
    setFolders(currentSettings.projectsPaths?.length ? [...currentSettings.projectsPaths] : []);
    setEditor('code');
    setSelectedLanguage('en');
    setTheme('dark');
    setNotificationConfig({
      enabled: true,
      sound: true,
      fetchAlerts: true,
      pullAlerts: true,
      modifiedAlerts: true,
      modifiedThreshold: 100,
      behindAlerts: true,
      behindThreshold: 90,
    });
    onShowToast?.('Reset preferences to defaults', 'info');
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);

    // Immediate audio chime if sound is enabled
    if (notificationConfig.sound) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        }
      } catch (err) {
        console.warn('Audio chime error:', err);
      }
    }

    try {
      const api = window.gityAPI || window.api;
      const title = 'Gity Notification Test';
      const body = 'Desktop notifications are working successfully! 🎉';

      if (api?.showNotification) {
        await api.showNotification(title, body, notificationConfig.sound);
        onShowToast?.(t('testNotificationSent'), 'success');
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(title, { body });
          } else if (Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              new Notification(title, { body });
            }
          }
        }
        onShowToast?.('Please restart Gity (quit & re-run npm run dev) to load desktop notification handler', 'info');
      }
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to send test notification', 'error');
    } finally {
      setTimeout(() => setIsTestingNotification(false), 500);
    }
  };

  const handleSave = async () => {
    if (folders.length === 0) {
      onShowToast?.(t('atLeastOneFolder'), 'error');
      return;
    }

    setIsSaving(true);
    try {
      setLanguage(selectedLanguage);
      await onSave({
        projectsPaths: folders,
        projectsPath: folders[0],
        editor,
        theme,
        notifications: notificationConfig.enabled,
        notificationSettings: notificationConfig,
      });
      onShowToast?.('Settings saved successfully', 'success');
      onBack();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = 
    JSON.stringify(folders) !== JSON.stringify(currentSettings.projectsPaths || [currentSettings.projectsPath]) ||
    editor !== currentSettings.editor ||
    selectedLanguage !== language ||
    theme !== (currentSettings.theme || 'dark') ||
    JSON.stringify(notificationConfig) !== JSON.stringify(currentSettings.notificationSettings || {
      enabled: currentSettings.notifications ?? true,
      sound: true,
      fetchAlerts: true,
      pullAlerts: true,
      modifiedAlerts: true,
      modifiedThreshold: 100,
      behindAlerts: true,
      behindThreshold: 90,
    });

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0d111d] text-slate-800 dark:text-slate-100 select-none overflow-hidden">
      {/* Titlebar Drag Area */}
      <div className="titlebar-drag h-10 w-full flex-shrink-0" />

      {/* Top Navigation Bar */}
      <header className="no-drag bg-white/95 dark:bg-[#131929]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="studio-btn h-8 px-3 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer group gap-2"
          >
            {isRTL ? (
              <ArrowRight className="w-3.5 h-3.5 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 text-sky-500 group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span>{t('backToProjects')}</span>
            <kbd className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
              ESC
            </kbd>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  {t('settingsTitle')}
                </h1>
                <span className="studio-pill bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] py-0 px-2 font-semibold">
                  PREFERENCES
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Workspace configuration & defaults</p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="studio-btn h-8 px-3 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-1.5"
            title={t('resetDefault')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('resetDefault')}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`studio-btn-primary h-8 px-4 text-xs font-semibold cursor-pointer gap-1.5 flex items-center justify-center whitespace-nowrap ${
              isDirty ? 'ring-2 ring-sky-500/40' : ''
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? t('saving') : t('saveSettingsBtn')}</span>
          </button>
        </div>
      </header>

      {/* Main Settings Page Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Card 1: Workspace Folders */}
          <section className="studio-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-sky-500" />
                <div>
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t('workspaceDefaults')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {t('projectsDirHelp')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenManageFolders && (
                  <button
                    type="button"
                    onClick={onOpenManageFolders}
                    className="studio-btn h-8 px-3 text-xs text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer gap-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t('manageFolders')}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="studio-btn-primary h-8 px-3.5 text-xs font-semibold cursor-pointer gap-1.5 flex items-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addFolder')}</span>
                </button>
              </div>
            </div>

            {/* Folder List */}
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden">
              {folders.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No workspace directories attached.
                </div>
              ) : (
                folders.map((folderPath, idx) => {
                  const matchingCount = projects.filter(
                    p => p.rootPath === folderPath || p.path.startsWith(folderPath)
                  ).length;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-sky-500 shrink-0">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate block" title={folderPath}>
                            {folderPath}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <span className="text-sky-600 dark:text-sky-400 font-semibold">{matchingCount}</span> projects detected
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyPath(folderPath)}
                          title={t('copyPath')}
                          className="studio-btn p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          {copiedPath === folderPath ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFolder(folderPath)}
                          disabled={folders.length <= 1}
                          title={folders.length <= 1 ? t('atLeastOneFolder') : t('removeFolder')}
                          className="studio-btn p-1.5 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Card 2: Language & Interface & Theme */}
          <section className="studio-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <Languages className="w-4 h-4 text-sky-500" />
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {t('generalSettings')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {t('languageSetting')} & Theme Appearance
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('languageSetting')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedLanguage === 'en'
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇺🇸</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('englishLang')}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Left-to-Right (LTR)</p>
                    </div>
                  </div>
                  {selectedLanguage === 'en' && <Check className="w-4 h-4 text-sky-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage('ar')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedLanguage === 'ar'
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇸🇦</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('arabicLang')}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Right-to-Left (RTL)</p>
                    </div>
                  </div>
                  {selectedLanguage === 'ar' && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              </div>
            </div>

            {/* Theme Appearance Selector */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Appearance</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    theme === 'dark'
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('darkMode')}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Linear & Raycast dark palette</p>
                    </div>
                  </div>
                  {theme === 'dark' && <Check className="w-4 h-4 text-sky-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    theme === 'light'
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-500">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('lightMode')}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Clean studio light aesthetic</p>
                    </div>
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              </div>
            </div>
          </section>

          {/* Card 3: DESKTOP NOTIFICATIONS CONFIGURATION */}
          <section className="p-6 rounded-2xl studio-card shadow-lg flex flex-col gap-5">
            {/* Header with Icon, Title, Subtitle and Send Test Notification Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Desktop Notifications Configuration
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Customize alerts, notification triggers, and sound settings.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestNotification}
                disabled={isTestingNotification}
                className="studio-btn px-3.5 py-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer gap-2 shrink-0 self-start sm:self-center"
              >
                <Send className={`w-3.5 h-3.5 ${isTestingNotification ? 'animate-bounce' : ''}`} />
                <span>Send Test Notification</span>
              </button>
            </div>

            {/* Top Toggle Controls (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Enable Desktop Notifications */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Enable Desktop Notifications
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                    notificationConfig.enabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ${
                      notificationConfig.enabled ? (isRTL ? '-translate-x-5' : 'translate-x-5') : (isRTL ? '-translate-x-0.5' : 'translate-x-0.5')
                    }`}
                  />
                </button>
              </div>

              {/* Play Alert Sounds */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Play Alert Sounds
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationConfig(prev => ({ ...prev, sound: !prev.sound }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                    notificationConfig.sound ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ${
                      notificationConfig.sound ? (isRTL ? '-translate-x-5' : 'translate-x-5') : (isRTL ? '-translate-x-0.5' : 'translate-x-0.5')
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Event Triggers Section Title */}
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pt-1">
              EVENT TRIGGERS
            </div>

            {/* Status Alerts (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trigger 1: Fetch All Notification */}
              <div 
                onClick={() => setNotificationConfig(prev => ({ ...prev, fetchAlerts: !prev.fetchAlerts }))}
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-sky-500/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Fetch All Notification
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  notificationConfig.fetchAlerts ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-white/[0.06] border border-slate-300 dark:border-white/[0.1]'
                }`}>
                  {notificationConfig.fetchAlerts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Trigger 2: Pull All Notification */}
              <div 
                onClick={() => setNotificationConfig(prev => ({ ...prev, pullAlerts: !prev.pullAlerts }))}
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-sky-500/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Pull All Notification
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  notificationConfig.pullAlerts ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-white/[0.06] border border-slate-300 dark:border-white/[0.1]'
                }`}>
                  {notificationConfig.pullAlerts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </section>

          {/* Card 4: Code Editor & CLI */}
          <section className="studio-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <Code className="w-4 h-4 text-sky-500" />
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {t('editorSettings')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {t('preferredEditor')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'code', name: 'VS Code', cmd: 'code' },
                { id: 'cursor', name: 'Cursor', cmd: 'cursor' },
                { id: 'phpstorm', name: 'PhpStorm', cmd: 'pstorm' },
                { id: 'subl', name: 'Sublime', cmd: 'subl' },
              ].map((item) => {
                const isSelected = editor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEditor(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/50 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold">{item.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                    </div>
                    <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06] w-fit">
                      {item.cmd} &lt;path&gt;
                    </code>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 5: Keyboard Shortcuts & About Gity */}
          <section className="studio-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <Command className="w-4 h-4 text-indigo-500" />
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {t('aboutTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Keyboard shortcuts & system overview
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
                const cmdKey = isMac ? '⌘' : 'Ctrl+';
                return [
                  { key: `${cmdKey}R`, desc: 'Reload projects' },
                  { key: `${cmdKey},`, desc: 'Open settings' },
                  { key: `${cmdKey}F`, desc: 'Search projects' },
                  { key: 'ESC', desc: 'Back to overview' },
                ];
              })().map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.desc}</span>
                  <kbd className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-white dark:bg-white/[0.06] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span>Gity Studio // Professional Git & Laravel Manager v1.0</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Electron + React + Tailwind</span>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};
