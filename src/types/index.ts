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
}

export interface AppSettings {
  projectsPaths: string[];
  projectsPath?: string;
  editor: string;
  theme: 'dark' | 'light';
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

export type FilterCategory = 'all' | 'laravel' | 'modified' | 'behind' | 'clean';
export type ViewMode = 'grid' | 'list';

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
