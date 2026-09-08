import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  changeFolder: string;
  fetchAll: string;
  fetchingAllProgress: string;
  fetchAllResult: string;
  pullAll: string;
  pullingAllProgress: string;
  pullAllResult: string;
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
  pullNow: string;
  pulling: string;
  push: string;
  pushing: string;
  pushSuccess: string;
  pushFailed: string;
  pushModifications: string;
  commitAndPushTitle: string;
  commitMsgPlaceholder: string;
  commitAndPushBtn: string;
  committingAndPushing: string;
  pushToRemote: string;
  gitStatusTitle: string;
  branch: string;
  switchBranch: string;
  switchingBranch: string;
  branchSwitched: string;
  branchCheckoutFailed: string;
  searchBranches: string;
  noBranchesFound: string;
  localBranches: string;
  workingTree: string;
  ahead: string;
  behindMetric: string;
  upstream: string;
  pathLabel: string;
  techStack: string;
  badgeCollection: string;
  badgeCollectionSubtitle: string;
  stackDistribution: string;
  javascriptProjects: string;
  pythonProjects: string;
  laravelSpecs: string;
  stackSpecs: string;
  framework: string;
  phpConstraint: string;
  environment: string;
  database: string;
  remotesTitle: string;
  editRemote: string;
  setRemoteUrl: string;
  remoteUrlPlaceholder: string;
  saveRemote: string;
  addRemote: string;
  recentCommitsTitle: string;
  modificationsTitle: string;
  filterFilesPlaceholder: string;
  resetChanges: string;
  resetAllChanges: string;
  resettingChanges: string;
  resetConfirmTitle: string;
  resetConfirmDesc: string;
  resetIncludeUntracked: string;
  confirmResetBtn: string;
  discardFile: string;
  discardFileConfirm: string;
  resetSuccess: string;
  cleanTreeTitle: string;
  cleanTreeDesc: string;
  syncedWith: string;
  selectFileToInspect: string;
  summaryStats: string;
  settingsTitle: string;
  settingsSubtitle: string;
  generalSettings: string;
  editorSettings: string;
  workspaceDefaults: string;
  aboutTitle: string;
  projectsRootDir: string;
  browseBtn: string;
  projectsDirHelp: string;
  preferredEditor: string;
  languageSetting: string;
  notificationsSetting: string;
  notificationsHelp: string;
  testNotificationBtn: string;
  testNotificationSent: string;
  testNotificationTitle: string;
  testNotificationBody: string;
  notificationMacHelp: string;
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
  darkMode: string;
  lightMode: string;
  inspectingGit: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Gity',
    appSubtitle: 'Laravel & Git Manager',
    changeFolder: 'Click to change folder',
    fetchAll: 'Fetch All',
    fetchingAllProgress: 'Fetching ({current}/{total})...',
    fetchAllResult: 'Fetch All: {success} succeeded, {failed} failed',
    pullAll: 'Pull All',
    pullingAllProgress: 'Pulling ({current}/{total})...',
    pullAllResult: 'Pull All: {success} succeeded, {failed} failed',
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
    pullNow: 'Pull Now',
    pulling: 'Pulling',
    push: 'Push',
    pushing: 'Pushing',
    pushSuccess: 'Pushed successfully',
    pushFailed: 'Push failed',
    pushModifications: 'Push Modifications',
    commitAndPushTitle: 'Commit & Push Modifications',
    commitMsgPlaceholder: 'Write a commit message describing your changes...',
    commitAndPushBtn: 'Commit & Push',
    committingAndPushing: 'Committing & Pushing...',
    pushToRemote: 'Push to Remote',
    gitStatusTitle: 'Git Status',
    branch: 'Branch',
    switchBranch: 'Switch branch',
    switchingBranch: 'Switching to {branch}...',
    branchSwitched: 'Switched to branch "{branch}"',
    branchCheckoutFailed: 'Checkout failed: {error}',
    searchBranches: 'Search branches...',
    noBranchesFound: 'No branches found',
    localBranches: 'Branches',
    workingTree: 'Working Tree',
    ahead: 'Ahead',
    behindMetric: 'Behind',
    upstream: 'Upstream',
    pathLabel: 'Path',
    techStack: 'Tech Stack',
    badgeCollection: 'Badge Collection',
    badgeCollectionSubtitle: 'Explore all tech badges, status pills, and indicators',
    stackDistribution: 'Stack Breakdown',
    javascriptProjects: 'JavaScript / TS',
    pythonProjects: 'Python',
    laravelSpecs: 'Laravel Framework Details',
    stackSpecs: 'Project Tech Specs',
    framework: 'Framework',
    phpConstraint: 'PHP Constraint',
    environment: 'Environment',
    database: 'Database',
    remotesTitle: 'Remote Repositories',
    editRemote: 'Edit Remote URL',
    setRemoteUrl: 'Set Remote URL',
    remoteUrlPlaceholder: 'https://github.com/user/repo.git or git@github.com:...',
    saveRemote: 'Save URL',
    addRemote: 'Add Remote',
    recentCommitsTitle: 'Recent Commit History',
    modificationsTitle: 'List of Modifications',
    filterFilesPlaceholder: 'Filter changed files...',
    resetChanges: 'Reset Changes',
    resetAllChanges: 'Reset All Changes',
    resettingChanges: 'Resetting...',
    resetConfirmTitle: 'Reset All Uncommitted Changes?',
    resetConfirmDesc: 'This will permanently discard all modifications and staged edits in this repository. This action cannot be undone.',
    resetIncludeUntracked: 'Also delete untracked files & new folders',
    confirmResetBtn: 'Discard All Changes',
    discardFile: 'Discard File',
    discardFileConfirm: 'Are you sure you want to discard changes to {file}?',
    resetSuccess: 'Changes have been reset successfully',
    cleanTreeTitle: 'Working tree is completely clean',
    cleanTreeDesc: 'There are no uncommitted modifications, unstaged edits, or untracked files in this project.',
    syncedWith: 'Synced with',
    selectFileToInspect: 'Select a file above to inspect changes',
    summaryStats: 'Summary Stats',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage workspace and project folder settings',
    generalSettings: 'General & Interface',
    editorSettings: 'Code Editor & Tools',
    workspaceDefaults: 'Workspace Directories',
    aboutTitle: 'About Gity',
    projectsRootDir: 'Projects Root Directory',
    browseBtn: 'Browse...',
    projectsDirHelp: 'All subdirectories in this folder will be scanned and displayed in Gity.',
    preferredEditor: 'Preferred Code Editor',
    languageSetting: 'Application Language',
    notificationsSetting: 'Desktop Notifications',
    notificationsHelp: 'Receive desktop alerts when bulk operations (Fetch All / Pull All) finish',
    testNotificationBtn: 'Send Test Notification',
    testNotificationSent: 'Test notification sent! Check your screen top-right or notification center.',
    testNotificationTitle: 'Gity - Notification Test',
    testNotificationBody: 'Desktop notifications are working successfully! 🎉',
    notificationMacHelp: 'If no banner appears, ensure notifications are allowed for Electron/Gity in macOS System Settings > Notifications.',
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
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    inspectingGit: 'Inspecting Git working tree...',
  },
  ar: {
    appTitle: 'Gity',
    appSubtitle: 'مدير مشاريع لارافيل وجيت',
    changeFolder: 'انقر لتغيير المجلد',
    fetchAll: 'جلب الكل',
    fetchingAllProgress: 'جاري الجلب ({current}/{total})...',
    fetchAllResult: 'جلب الكل: نجح {success}، وفشل {failed}',
    pullAll: 'سحب الكل (Pull All)',
    pullingAllProgress: 'جاري سحب التغييرات ({current}/{total})...',
    pullAllResult: 'سحب الكل: نجح {success}، وفشل {failed}',
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
    pullNow: 'سحب الآن',
    pulling: 'جاري السحب',
    push: 'رفع',
    pushing: 'جاري الرفع',
    pushSuccess: 'تم الرفع بنجاح',
    pushFailed: 'فشل الرفع',
    pushModifications: 'رفع التعديلات',
    commitAndPushTitle: 'تثبيت ورفع التعديلات',
    commitMsgPlaceholder: 'اكتب وصفاً للتعديلات...',
    commitAndPushBtn: 'تثبيت ورفع',
    committingAndPushing: 'جاري التثبيت والرفع...',
    pushToRemote: 'رفع التغييرات إلى المستودع البعيد',
    gitStatusTitle: 'حالة Git',
    branch: 'الفرع',
    switchBranch: 'تبديل الفرع',
    switchingBranch: 'جاري التبديل إلى {branch}...',
    branchSwitched: 'تم التبديل بنجاح إلى الفرع "{branch}"',
    branchCheckoutFailed: 'فشل التبديل: {error}',
    searchBranches: 'بحث في الفروع...',
    noBranchesFound: 'لم يتم العثور على فروع',
    localBranches: 'الفروع',
    workingTree: 'شجرة العمل',
    ahead: 'متقدم',
    behindMetric: 'متأخر',
    upstream: 'المستودع البعيد',
    pathLabel: 'المسار',
    techStack: 'التقنيات المستخدمة',
    badgeCollection: 'مجموعة الشارات والرموز',
    badgeCollectionSubtitle: 'استكشاف جميع شارات التقنيات وحالات المستودعات',
    stackDistribution: 'توزيع اللغات والتقنيات',
    javascriptProjects: 'جافاسكريبت / تايب سكريبت',
    pythonProjects: 'بايثون',
    laravelSpecs: 'تفاصيل إطار عمل لارافيل',
    stackSpecs: 'المواصفات التقنية للمشروع',
    framework: 'إطار العمل',
    phpConstraint: 'إصدار PHP',
    environment: 'البيئة',
    database: 'قاعدة البيانات',
    remotesTitle: 'المستودعات البعيدة (Remotes)',
    editRemote: 'تعديل رابط المستودع',
    setRemoteUrl: 'تعيين رابط المستودع البعيد',
    remoteUrlPlaceholder: 'https://github.com/user/repo.git أو git@github.com:...',
    saveRemote: 'حفظ الرابط',
    addRemote: 'إضافة مستودع بعيد',
    recentCommitsTitle: 'سجل آخر الإيداعات',
    modificationsTitle: 'قائمة التعديلات',
    filterFilesPlaceholder: 'تصفية الملفات المعدلة...',
    resetChanges: 'إلغاء التعديلات (Reset)',
    resetAllChanges: 'إلغاء كافة التعديلات',
    resettingChanges: 'جاري الإلغاء...',
    resetConfirmTitle: 'هل تريد إلغاء كافة التعديلات؟',
    resetConfirmDesc: 'سيؤدي هذا إلى التراجع عن جميع الملفات المعدلة نهائياً. لا يمكن التراجع عن هذا الإجراء.',
    resetIncludeUntracked: 'حذف الملفات والمجلدات غير المتعقبة أيضاً',
    confirmResetBtn: 'إلغاء التعديلات نهائياً',
    discardFile: 'إلغاء تعديلات الملف',
    discardFileConfirm: 'هل أنت متأكد من إلغاء التعديلات على {file}؟',
    resetSuccess: 'تم إلغاء التعديلات بنجاح',
    cleanTreeTitle: 'شجرة العمل نظيفة تماماً',
    cleanTreeDesc: 'لا توجد أي تعديلات غير محفوظة أو ملفات غير متتبعة في هذا المشروع.',
    syncedWith: 'متزامن مع',
    selectFileToInspect: 'اختر ملفاً من الأعلى لمعاينة الفروقات',
    summaryStats: 'ملخص الفروقات',
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'إدارة مجلد مساحة العمل والخيارات',
    generalSettings: 'العامة والواجهة',
    editorSettings: 'محرر الأكواد والأدوات',
    workspaceDefaults: 'مجلدات مساحة العمل',
    aboutTitle: 'حول تطبيق Gity',
    projectsRootDir: 'المجلد الرئيسي للمشاريع',
    browseBtn: 'استعراض...',
    projectsDirHelp: 'سيتم فحص جميع المجلدات الفرعية داخل هذا المجلد وعرضها في Gity.',
    preferredEditor: 'محرر الأكواد المفضل',
    languageSetting: 'لغة التطبيق',
    notificationsSetting: 'إشعارات سطح المكتب (Notifications)',
    notificationsHelp: 'تلقي إشعارات على سطح المكتب عند انتهاء عمليات الجلب والسحب الجماعية',
    testNotificationBtn: 'إرسال إشعار تجريبي',
    testNotificationSent: 'تم إرسال الإشعار التجريبي! تفقد أعلى الشاشة أو مركز الإشعارات.',
    testNotificationTitle: 'Gity - اختبار الإشعارات',
    testNotificationBody: 'إشعارات سطح المكتب تعمل بنجاح! 🎉',
    notificationMacHelp: 'إذا لم يظهر الإشعار، تأكد من السماح بالإشعارات في إعدادات نظام ماك > الإشعارات.',
    resetDefault: 'استعادة الافتراضي',
    cancelBtn: 'إلغاء',
    saveSettingsBtn: 'حفظ الإعدادات',
    saving: 'جاري الحفظ...',
    englishLang: 'English',
    arabicLang: 'العربية (Arabic)',
    doneBtn: 'تم',
    rawGitOutput: 'مخرجات جيت النصية',
    diffSummary: 'إحصائيات الفروقات',
    changedFiles: 'الملفات المعدلة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
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
