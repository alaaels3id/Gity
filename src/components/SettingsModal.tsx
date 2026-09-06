import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  Settings as SettingsIcon,
  Languages,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  currentSettings: AppSettings;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
  onOpenManageFoldersPage?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentSettings,
  onClose,
  onSave,
  onOpenManageFoldersPage,
}) => {
  const { t, language, setLanguage } = useLanguage();
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
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFolder = async () => {
    try {
      const api = window.gityAPI || window.api;
      if (api?.selectDirectory) {
        const selected = await api.selectDirectory();
        if (selected) {
          if (folders.includes(selected)) {
            setErrorMessage(t('folderAlreadyAdded'));
            setTimeout(() => setErrorMessage(null), 3000);
            return;
          }
          setFolders(prev => [...prev, selected]);
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleRemoveFolder = (folderToRemove: string) => {
    if (folders.length <= 1) {
      setErrorMessage(t('atLeastOneFolder'));
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setFolders(prev => prev.filter(f => f !== folderToRemove));
  };

  const handleReset = () => {
    setFolders(currentSettings.projectsPaths?.length ? [...currentSettings.projectsPaths] : []);
    setEditor('code');
    setSelectedLanguage('en');
  };

  const handleSave = async () => {
    if (folders.length === 0) {
      setErrorMessage(t('atLeastOneFolder'));
      return;
    }

    setIsSaving(true);
    try {
      setLanguage(selectedLanguage);
      await onSave({
        projectsPaths: folders,
        projectsPath: folders[0],
        editor,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="studio-card bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{t('settingsTitle')}</h2>
                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Workspace Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg studio-btn text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5 text-xs text-rose-500 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Multiple Project Folders Management */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <FolderGit2 className="w-4 h-4 text-sky-500" />
                  <span>{t('manageFolders')}</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  {t('projectsDirHelp')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenManageFoldersPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenManageFoldersPage();
                    }}
                    className="text-xs text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all font-semibold"
                  >
                    Full View →
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="studio-btn-primary px-3 py-1.5 text-xs cursor-pointer gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addFolder')}</span>
                </button>
              </div>
            </div>

            {/* Folders List */}
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden">
              {folders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No storage volumes connected.
                </div>
              ) : (
                folders.map((folderPath, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate block" title={folderPath}>
                        {folderPath}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFolder(folderPath)}
                      disabled={folders.length <= 1}
                      title={folders.length <= 1 ? t('atLeastOneFolder') : t('removeFolder')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Languages className="w-4 h-4 text-sky-500" />
              <span>{t('languageSetting')}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <span>{t('englishLang')}</span>
                {selectedLanguage === 'en' && <Check className="w-4 h-4 text-sky-500" />}
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('ar')}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'ar'
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <span>{t('arabicLang')}</span>
                {selectedLanguage === 'ar' && <Check className="w-4 h-4 text-sky-500" />}
              </button>
            </div>
          </div>

          {/* Code Editor Selection */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('preferredEditor')}
            </label>
            <select
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              className="bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-white/[0.08] focus:border-sky-500/50 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none transition-colors font-mono cursor-pointer"
            >
              <option value="code">Visual Studio Code (code)</option>
              <option value="cursor">Cursor (cursor)</option>
              <option value="phpstorm">PhpStorm (pstorm)</option>
              <option value="subl">Sublime Text (subl)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDefault')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="studio-btn px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || folders.length === 0}
              className="studio-btn-primary px-5 py-2 text-xs cursor-pointer gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? t('saving') : t('saveSettingsBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
