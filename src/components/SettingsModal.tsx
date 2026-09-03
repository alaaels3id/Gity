import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Folder, 
  RotateCcw, 
  Check, 
  Languages, 
  Plus, 
  Trash2, 
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';
import { useLanguage, Language } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  currentSettings: AppSettings;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentSettings,
  onClose,
  onSave,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [folders, setFolders] = useState<string[]>([]);
  const [editor, setEditor] = useState(currentSettings.editor);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialPaths = currentSettings.projectsPaths?.length
        ? currentSettings.projectsPaths
        : currentSettings.projectsPath
        ? [currentSettings.projectsPath]
        : ['/Users/alaaelsaid/code'];

      setFolders([...initialPaths]);
      setEditor(currentSettings.editor || 'code');
      setSelectedLanguage(language);
      setErrorMessage(null);
    }
  }, [isOpen, currentSettings, language]);

  if (!isOpen) return null;

  const handleAddFolder = async () => {
    setErrorMessage(null);
    const api = window.gityAPI || window.api;
    if (api?.selectFolder) {
      try {
        const selected = await api.selectFolder();
        if (selected) {
          const trimmed = selected.trim();
          if (folders.includes(trimmed)) {
            setErrorMessage(t('folderAlreadyAdded'));
            return;
          }
          setFolders(prev => [...prev, trimmed]);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to select directory');
      }
    }
  };

  const handleRemoveFolder = (folderToRemove: string) => {
    setErrorMessage(null);
    if (folders.length <= 1) {
      setErrorMessage(t('atLeastOneFolder'));
      return;
    }
    setFolders(prev => prev.filter(f => f !== folderToRemove));
  };

  const handleReset = () => {
    setFolders(['/Users/alaaelsaid/code']);
    setEditor('code');
    setSelectedLanguage('en');
    setErrorMessage(null);
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111827] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{t('settingsTitle')}</h2>
              <p className="text-xs text-slate-400">{t('manageFoldersSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl px-3.5 py-2.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Multiple Project Folders Management */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  {t('manageFolders')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {t('projectsDirHelp')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddFolder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addFolder')}</span>
              </button>
            </div>

            {/* Folders List */}
            <div className="bg-black/40 border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
              {folders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No folders added yet.
                </div>
              ) : (
                folders.map((folderPath, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-slate-200 truncate block" title={folderPath}>
                          {folderPath}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFolder(folderPath)}
                      disabled={folders.length <= 1}
                      title={folders.length <= 1 ? t('atLeastOneFolder') : t('removeFolder')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-400" />
              {t('languageSetting')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t('englishLang')}</span>
                {selectedLanguage === 'en' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('ar')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLanguage === 'ar'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t('arabicLang')}</span>
                {selectedLanguage === 'ar' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Code Editor Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-slate-200">
              {t('preferredEditor')}
            </label>
            <select
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              className="bg-black/40 border border-white/10 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition-colors"
            >
              <option value="code">Visual Studio Code (code)</option>
              <option value="cursor">Cursor (cursor)</option>
              <option value="phpstorm">PhpStorm (pstorm)</option>
              <option value="subl">Sublime Text (subl)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-slate-900/50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('resetDefault')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || folders.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? t('saving') : t('saveSettingsBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
