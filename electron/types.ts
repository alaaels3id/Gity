export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timeAgo: string;
}

export interface GitSummary {
  isGit: boolean;
  branch: string;
  clean: boolean;
  modifiedCount: number;
  ahead: number;
  behind: number;
  lastCommit: CommitInfo | null;
  error?: string;
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

export interface ProjectItem extends GitSummary {
  id: string;
  name: string;
  path: string;
  rootPath?: string;
  rootFolderName?: string;
  isLaravel: boolean;
  laravelVersion: string | null;
  phpVersion: string | null;
}

export interface AppSettings {
  projectsPaths: string[];
  projectsPath?: string; // backwards compatibility
  editor: string;
  theme: 'dark' | 'light';
}

export interface FetchResult {
  success: boolean;
  message: string;
  duration: string;
  summary: GitSummary;
}

export interface ProjectDetails {
  project: ProjectItem;
  status: DetailedGitStatus;
  recentCommits: CommitInfo[];
  remotes: { name: string; url: string }[];
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
}

export interface GityAPI {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  selectFolder: (currentPath?: string) => Promise<string | null>;
  scanProjects: (folderPaths?: string | string[]) => Promise<ProjectItem[]>;
  openLocation: (projectPath: string) => Promise<boolean>;
  fetchRemote: (projectPath: string) => Promise<FetchResult>;
  getStatus: (projectPath: string) => Promise<DetailedGitStatus>;
  getProjectDetails: (projectPath: string) => Promise<ProjectDetails>;
  getFileDiff: (projectPath: string, filePath: string) => Promise<string>;
  openEditor: (projectPath: string, editor?: string) => Promise<boolean>;
}

declare global {
  interface Window {
    gityAPI: GityAPI;
    api?: GityAPI;
  }
}
