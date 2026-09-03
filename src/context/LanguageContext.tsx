import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  changeFolder: string;
  fetchAll: string;
  fetchingAllProgress: string;
  refresh: string;
  settings: string;
  searchPlaceholder: string;
  all: string;
  allProjects: string;
  laravel: string;
  laravelProjectsNav: string;
  modified: string;
  modifiedRepos: string;
  behind: string;
  behindRemote: string;
  clean: string;
  cleanRepos: string;
  navigation: string;
  workspaceOverview: string;
  currentDirectory: string;
  projectFolders: string;
  manageFolders: string;
  manageFoldersSubtitle: string;
  addFolder: string;
  allFolders: string;
  removeFolder: string;
  folderAlreadyAdded: string;
  atLeastOneFolder: string;
  monitoredFolders: string;
  rescanFolder: string;
  gridView: string;
  listView: string;
  projectCol: string;
  gitStatusCol: string;
  latestCommitCol: string;
  actionsCol: string;
  location: string;
  fetch: string;
  fetching: string;
  status: string;
  details: string;
  noCommitData: string;
  noGit: string;
  cleanBadge: string;
  modifiedBadge: string;
  scanningText: string;
  couldNotScan: string;
  noProjectsFound: string;
  noProjectsMatching: string;
  configureDirectory: string;
  changeFolderBtn: string;
  totalProjects: string;
  laravelProjects: string;
  gitRepos: string;
  macWorkspace: string;
  backToProjects: string;
  copyPath: string;
  pathCopied: string;
  openInFinder: string;
  openInEditor: string;
  fetchRemote: string;
  gitStatusTitle: string;
  branch: string;
  workingTree: string;
  ahead: string;
  behindMetric: string;
  upstream: string;
  pathLabel: string;
  laravelSpecs: string;
  framework: string;
  phpConstraint: string;
  environment: string;
  database: string;
  remotesTitle: string;
  recentCommitsTitle: string;
  modificationsTitle: string;
  filterFilesPlaceholder: string;
  cleanTreeTitle: string;
  cleanTreeDesc: string;
  syncedWith: string;
  selectFileToInspect: string;
  summaryStats: string;
  settingsTitle: string;
  settingsSubtitle: string;
  projectsRootDir: string;
  browseBtn: string;
  projectsDirHelp: string;
  preferredEditor: string;
  languageSetting: string;
  resetDefault: string;
  cancelBtn: string;
  saveSettingsBtn: string;
  saving: string;
  englishLang: string;
  arabicLang: string;
  doneBtn: string;
  rawGitOutput: string;
  diffSummary: string;
  changedFiles: string;
  inspectingGit: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Gity',
    appSubtitle: 'Laravel & Git Manager',
    changeFolder: 'Click to change folder',
    fetchAll: 'Fetch All',
    fetchingAllProgress: 'Fetching ({current}/{total})...',
    refresh: 'Reload projects (⌘R)',
    settings: 'Open Settings (⌘,)',
    searchPlaceholder: 'Search projects...',
    all: 'All',
    allProjects: 'All Projects',
    laravel: 'Laravel',
    laravelProjectsNav: 'Laravel Projects',
    modified: 'Modified',
    modifiedRepos: 'Modified Repos',
    behind: 'Behind Remote',
    behindRemote: 'Behind Remote',
    clean: 'Clean',
    cleanRepos: 'Clean Working Tree',
    navigation: 'Navigation',
    workspaceOverview: 'Workspace Overview',
    currentDirectory: 'Current Directory',
    projectFolders: 'Project Folders',
    manageFolders: 'Manage Project Folders',
    manageFoldersSubtitle: 'Add, remove, or switch project directories to scan',
    addFolder: 'Add Folder',
    allFolders: 'All Folders',
    removeFolder: 'Remove Folder',
    folderAlreadyAdded: 'Folder is already added',
    atLeastOneFolder: 'You must keep at least one project folder',
    monitoredFolders: 'Monitored Folders',
    rescanFolder: 'Rescan Folder',
    gridView: 'Grid View',
    listView: 'List View',
    projectCol: 'Project',
    gitStatusCol: 'Git Status',
    latestCommitCol: 'Latest Commit',
    actionsCol: 'Actions',
    location: 'Location',
    fetch: 'Fetch',
    fetching: 'Fetching',
    status: 'Status',
    details: 'Details',
    noCommitData: 'No recent commit data',
    noGit: 'No Git',
    cleanBadge: 'Clean',
    modifiedBadge: 'modified',
    scanningText: 'Scanning projects in',
    couldNotScan: 'Could not scan directory',
    noProjectsFound: 'No projects found',
    noProjectsMatching: 'No projects matched the current filter or search query',
    configureDirectory: 'Configure Directory',
    changeFolderBtn: 'Change Folder',
    totalProjects: 'Total Projects',
    laravelProjects: 'Laravel',
    gitRepos: 'Git Repos',
    macWorkspace: 'Gity macOS Workspace',
    backToProjects: 'Back to Projects',
    copyPath: 'Copy Path',
    pathCopied: 'Path copied to clipboard',
    openInFinder: 'Finder',
    openInEditor: 'Open in Editor',
    fetchRemote: 'Fetch Remote',
    gitStatusTitle: 'Git Status',
    branch: 'Branch',
    workingTree: 'Working Tree',
    ahead: 'Ahead',
    behindMetric: 'Behind',
    upstream: 'Upstream',
    pathLabel: 'Path',
    laravelSpecs: 'Laravel Framework Details',
    framework: 'Framework',
    phpConstraint: 'PHP Constraint',
    environment: 'Environment',
    database: 'Database',
    remotesTitle: 'Remote Repositories',
    recentCommitsTitle: 'Recent Commit History',
    modificationsTitle: 'List of Modifications',
    filterFilesPlaceholder: 'Filter changed files...',
    cleanTreeTitle: 'Working tree is completely clean',
    cleanTreeDesc: 'There are no uncommitted modifications, unstaged edits, or untracked files in this project.',
    syncedWith: 'Synced with',
    selectFileToInspect: 'Select a file above to inspect changes',
    summaryStats: 'Summary Stats',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage workspace and project folder settings',
    projectsRootDir: 'Projects Root Directory',
    browseBtn: 'Browse...',
    projectsDirHelp: 'All subdirectories in this folder will be scanned and displayed in Gity.',
    preferredEditor: 'Preferred Code Editor',
    languageSetting: 'Application Language',
    resetDefault: 'Reset to default',
    cancelBtn: 'Cancel',
    saveSettingsBtn: 'Save Settings',
    saving: 'Saving...',
    englishLang: 'English',
    arabicLang: 'العربية (Arabic)',
    doneBtn: 'Done',
    rawGitOutput: 'Raw Git Output',
    diffSummary: 'Diff Stats',
    changedFiles: 'Changed Files',
    inspectingGit: 'Inspecting Git working tree...',
  },
  ar: {
    appTitle: 'Gity',
    appSubtitle: 'مدير مشاريع لارافيل وجيت',
    changeFolder: 'انقر لتغيير المجلد',
    fetchAll: 'جلب الكل',
    fetchingAllProgress: 'جاري الجلب ({current}/{total})...',
    refresh: 'تحديث المشاريع (⌘R)',
    settings: 'الإعدادات (⌘,)',
    searchPlaceholder: 'بحث في المشاريع...',
    all: 'الكل',
    allProjects: 'جميع المشاريع',
    laravel: 'لارافيل',
    laravelProjectsNav: 'مشاريع لارافيل',
    modified: 'المعدلة',
    modifiedRepos: 'مشاريع بها تعديلات',
    behind: 'متأخرة عن المستودع',
    behindRemote: 'متأخرة عن المستودع',
    clean: 'نظيفة',
    cleanRepos: 'شجرة عمل نظيفة',
    navigation: 'التنقل',
    workspaceOverview: 'نظرة عامة',
    currentDirectory: 'المجلد الحالي',
    projectFolders: 'مجلدات المشاريع',
    manageFolders: 'إدارة مجلدات المشاريع',
    manageFoldersSubtitle: 'إضافة أو حذف مجلدات المشاريع المراد فحصها',
    addFolder: 'إضافة مجلد',
    allFolders: 'جميع المجلدات',
    removeFolder: 'إزالة المجلد',
    folderAlreadyAdded: 'المجلد مضاف بالفعل',
    atLeastOneFolder: 'يجب الاحتفاظ بمجلد واحد على الأقل',
    monitoredFolders: 'المجلدات المراقبة',
    rescanFolder: 'إعادة فحص المجلد',
    gridView: 'عرض شبكي',
    listView: 'عرض القائمة',
    projectCol: 'المشروع',
    gitStatusCol: 'حالة جيت',
    latestCommitCol: 'آخر إيداع',
    actionsCol: 'إجراءات',
    location: 'المجلد',
    fetch: 'جلب',
    fetching: 'جاري الجلب',
    status: 'الحالة',
    details: 'التفاصيل',
    noCommitData: 'لا يوجد سجل إيداعات',
    noGit: 'بدون جيت',
    cleanBadge: 'نظيف',
    modifiedBadge: 'معدل',
    scanningText: 'جاري فحص المشاريع في',
    couldNotScan: 'تعذر فحص المجلد',
    noProjectsFound: 'لم يتم العثور على مشاريع',
    noProjectsMatching: 'لا توجد مشاريع تطابق البحث أو التصفية الحالية',
    configureDirectory: 'تحديد المجلد',
    changeFolderBtn: 'تغيير المجلد',
    totalProjects: 'إجمالي المشاريع',
    laravelProjects: 'لارافيل',
    gitRepos: 'مستودعات جيت',
    macWorkspace: 'مساحة عمل Gity لنظام ماك',
    backToProjects: 'العودة للمشاريع',
    copyPath: 'نسخ المسار',
    pathCopied: 'تم نسخ المسار إلى الحافظة',
    openInFinder: 'فايندر',
    openInEditor: 'فتح في المحرر',
    fetchRemote: 'جلب من المستودع',
    gitStatusTitle: 'حالة جيت',
    branch: 'الفرع',
    workingTree: 'شجرة العمل',
    ahead: 'متقدم',
    behindMetric: 'متأخر',
    upstream: 'المستودع البعيد',
    pathLabel: 'المسار',
    laravelSpecs: 'تفاصيل إطار عمل لارافيل',
    framework: 'إطار العمل',
    phpConstraint: 'إصدار PHP',
    environment: 'البيئة',
    database: 'قاعدة البيانات',
    remotesTitle: 'المستودعات البعيدة',
    recentCommitsTitle: 'سجل آخر الإيداعات',
    modificationsTitle: 'قائمة التعديلات',
    filterFilesPlaceholder: 'تصفية الملفات المعدلة...',
    cleanTreeTitle: 'شجرة العمل نظيفة تماماً',
    cleanTreeDesc: 'لا توجد أي تعديلات غير محفوظة أو ملفات غير متتبعة في هذا المشروع.',
    syncedWith: 'متزامن مع',
    selectFileToInspect: 'اختر ملفاً من الأعلى لمعاينة الفروقات',
    summaryStats: 'ملخص الفروقات',
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'إدارة مجلد مساحة العمل والخيارات',
    projectsRootDir: 'المجلد الرئيسي للمشاريع',
    browseBtn: 'استعراض...',
    projectsDirHelp: 'سيتم فحص جميع المجلدات الفرعية داخل هذا المجلد وعرضها في Gity.',
    preferredEditor: 'محرر الأكواد المفضل',
    languageSetting: 'لغة التطبيق',
    resetDefault: 'إعادة للوضع الافتراضي',
    cancelBtn: 'إلغاء',
    saveSettingsBtn: 'حفظ الإعدادات',
    saving: 'جاري الحفظ...',
    englishLang: 'English',
    arabicLang: 'العربية (Arabic)',
    doneBtn: 'تم',
    rawGitOutput: 'مخرجات جيت النصية',
    diffSummary: 'إحصائيات الفروقات',
    changedFiles: 'الملفات المعدلة',
    inspectingGit: 'جاري فحص شجرة عمل جيت...',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gity_language');
    if (saved === 'en' || saved === 'ar') {
      return saved;
    }
    if (typeof navigator !== 'undefined' && navigator.language.startsWith('ar')) {
      return 'ar';
    }
    return 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    root.setAttribute('lang', language);
    root.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
    if (language === 'ar') {
      root.classList.add('rtl-layout');
    } else {
      root.classList.remove('rtl-layout');
    }
    localStorage.setItem('gity_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let str = translations[language]?.[key] || translations.en[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
