export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timeAgo: string;
}

export interface ChangedFile {
  code: string;
  label: string;
  type: 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed';
  path: string;
}

export interface DetailedGitStatus {
  branch: string;
  tracking: string;
  ahead: number;
  behind: number;
  clean: boolean;
  filesCount: number;
  files: ChangedFile[];
  rawStatus: string;
  diffStat: string;
  branchInfo: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  path: string;
  rootPath?: string;
  rootFolderName?: string;
  isLaravel: boolean;
  laravelVersion: string | null;
  phpVersion: string | null;
  isGit: boolean;
  branch: string;
  clean: boolean;
  modifiedCount: number;
  ahead: number;
  behind: number;
  lastCommit: CommitInfo | null;
  error?: string;
  branches?: string[];
  projectType?: ProjectType;
  projectTypeLabel?: string;
  framework?: string | null;
  frameworkVersion?: string | null;
  language?: string;
}

export type ProjectType = 'laravel' | 'javascript' | 'typescript' | 'python' | 'php' | 'go' | 'rust' | 'java' | 'ruby' | 'other';

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  fetchAlerts: boolean;
  pullAlerts: boolean;
  modifiedAlerts: boolean;
  modifiedThreshold: number;
  behindAlerts: boolean;
  behindThreshold: number;
}

export interface AppSettings {
  projectsPaths: string[];
  projectsPath?: string;
  editor: string;
  theme: 'dark' | 'light';
  notifications?: boolean;
  notificationSettings?: NotificationConfig;
}

export interface FetchResult {
  success: boolean;
  message: string;
  duration: string;
  summary: {
    isGit: boolean;
    branch: string;
    clean: boolean;
    modifiedCount: number;
    ahead: number;
    behind: number;
    lastCommit: CommitInfo | null;
  };
}

export interface PullResult {
  success: boolean;
  message: string;
  duration: string;
  summary: {
    isGit: boolean;
    branch: string;
    clean: boolean;
    modifiedCount: number;
    ahead: number;
    behind: number;
    lastCommit: CommitInfo | null;
  };
}

export interface RemoteResult {
  success: boolean;
  message: string;
  remotes?: { name: string; url: string }[];
}

export interface CheckoutResult {
  success: boolean;
  branch: string;
  message: string;
  summary?: {
    isGit: boolean;
    branch: string;
    clean: boolean;
    modifiedCount: number;
    ahead: number;
    behind: number;
    lastCommit: CommitInfo | null;
  };
}

export type FilterCategory = 'all' | 'laravel' | 'javascript' | 'python' | 'modified' | 'behind' | 'clean' | string;
export type ViewMode = 'grid' | 'list';

export interface ProjectDetails {
  project: ProjectItem;
  status: DetailedGitStatus;
  recentCommits: CommitInfo[];
  remotes: { name: string; url: string }[];
  branches?: string[];
  projectType?: ProjectType;
  projectTypeLabel?: string;
  framework?: string | null;
  frameworkVersion?: string | null;
  language?: string;
  envInfo?: {
    appName?: string;
    appEnv?: string;
    dbConnection?: string;
  };
  composerInfo?: {
    description?: string;
    dependenciesCount?: number;
    phpVersion?: string;
  };
  packageInfo?: {
    description?: string;
    dependenciesCount?: number;
    framework?: string;
    version?: string;
  };
}

export type GitStatusDetails = DetailedGitStatus;

export interface ResetResult {
  success: boolean;
  message: string;
  summary?: GitSummary;
}

export interface PushResult {
  success: boolean;
  message: string;
  duration: string;
  summary?: GitSummary;
}

export interface CommitAndPushResult {
  success: boolean;
  message: string;
  duration: string;
  summary?: GitSummary;
}

export interface GityAPI {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  selectFolder: (currentPath?: string) => Promise<string | null>;
  scanProjects: (folderPaths?: string | string[]) => Promise<ProjectItem[]>;
  openLocation: (projectPath: string) => Promise<boolean>;
  fetchRemote: (projectPath: string) => Promise<FetchResult>;
  pullProject: (projectPath: string) => Promise<PullResult>;
  pushProject?: (projectPath: string, options?: { force?: boolean }) => Promise<PushResult>;
  commitAndPush?: (projectPath: string, message: string, files?: string[]) => Promise<CommitAndPushResult>;
  getStatus: (projectPath: string) => Promise<DetailedGitStatus>;
  getGitStatus?: (projectPath: string) => Promise<DetailedGitStatus>;
  getProjectDetails: (projectPath: string) => Promise<ProjectDetails>;
  getFileDiff: (projectPath: string, filePath: string) => Promise<string>;
  openEditor?: (projectPath: string, editor?: string) => Promise<boolean>;
  openInEditor?: (projectPath: string, editor?: string) => Promise<boolean>;
  getBranches: (projectPath: string) => Promise<string[]>;
  checkoutBranch: (projectPath: string, branch: string) => Promise<CheckoutResult>;
  setRemoteUrl: (projectPath: string, remoteName: string, newUrl: string) => Promise<RemoteResult>;
  resetChanges: (projectPath: string, options?: { filePath?: string; includeUntracked?: boolean }) => Promise<ResetResult>;
  showNotification?: (title: string, body: string, sound?: boolean) => Promise<boolean>;
}

declare global {
  interface Window {
    gityAPI: GityAPI;
    api?: GityAPI;
  }
}
