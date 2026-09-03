import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { GitSummary, DetailedGitStatus, FetchResult, ChangedFile } from './types';

function getGitEnv(): NodeJS.ProcessEnv {
  const currentPath = process.env.PATH || '';
  const defaultPaths = [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
  ];
  const combinedPath = Array.from(new Set([...currentPath.split(':'), ...defaultPaths]))
    .filter(Boolean)
    .join(':');

  return {
    ...process.env,
    PATH: combinedPath,
    GIT_TERMINAL_PROMPT: '0',
    GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=10',
  };
}

function runGitCommand(cmd: string, cwd: string, timeout = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout, maxBuffer: 1024 * 1024 * 2, env: getGitEnv() }, (error, stdout, stderr) => {
      if (error) {
        const errMsg = (stderr || error.message || '').trim();
        return reject(new Error(errMsg || `Git command failed: ${cmd}`));
      }
      resolve(stdout.trim());
    });
  });
}

export function isGitRepo(projectPath: string): boolean {
  try {
    const gitDir = path.join(projectPath, '.git');
    return fs.existsSync(gitDir);
  } catch {
    return false;
  }
}

export async function getGitSummary(projectPath: string): Promise<GitSummary> {
  if (!isGitRepo(projectPath)) {
    return {
      isGit: false,
      branch: 'No Git',
      clean: true,
      modifiedCount: 0,
      ahead: 0,
      behind: 0,
      lastCommit: null,
    };
  }

  try {
    const statusOutput = await runGitCommand('git status --porcelain=v1 -b', projectPath);
    const lines = statusOutput.split('\n').filter(Boolean);

    let branch = 'unknown';
    let ahead = 0;
    let behind = 0;
    let modifiedCount = 0;

    if (lines.length > 0 && lines[0].startsWith('##')) {
      const header = lines[0].substring(3).trim();
      const branchMatch = header.match(/^([^\s\.]+)/);
      if (branchMatch) {
        branch = branchMatch[1];
      }

      const aheadMatch = header.match(/ahead (\d+)/);
      if (aheadMatch) ahead = parseInt(aheadMatch[1], 10);

      const behindMatch = header.match(/behind (\d+)/);
      if (behindMatch) behind = parseInt(behindMatch[1], 10);

      modifiedCount = lines.length - 1;
    } else {
      modifiedCount = lines.length;
    }

    let lastCommit = null;
    try {
      const commitOutput = await runGitCommand('git log -1 --format="%h|%s|%an|%cr"', projectPath);
      if (commitOutput) {
        const [hash, message, author, timeAgo] = commitOutput.split('|');
        lastCommit = { hash, message, author, timeAgo };
      }
    } catch {
      // Empty repo or no commits yet
    }

    return {
      isGit: true,
      branch,
      clean: modifiedCount === 0,
      modifiedCount,
      ahead,
      behind,
      lastCommit,
    };
  } catch (err: any) {
    return {
      isGit: true,
      branch: 'error',
      clean: true,
      modifiedCount: 0,
      ahead: 0,
      behind: 0,
      lastCommit: null,
      error: err.message,
    };
  }
}

export async function fetchRemote(projectPath: string): Promise<FetchResult> {
  if (!isGitRepo(projectPath)) {
    return {
      success: false,
      message: 'Not a git repository',
      duration: '0s',
      summary: {
        isGit: false,
        branch: 'No Git',
        clean: true,
        modifiedCount: 0,
        ahead: 0,
        behind: 0,
        lastCommit: null,
      },
    };
  }

  const startTime = Date.now();
  try {
    const stdout = await runGitCommand('git fetch --all --prune', projectPath, 45000);
    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const updatedSummary = await getGitSummary(projectPath);

    return {
      success: true,
      message: stdout || 'Fetched all remotes successfully (up to date).',
      duration,
      summary: updatedSummary,
    };
  } catch (err: any) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const summary = await getGitSummary(projectPath);
    let errMsg = err.message || 'Remote fetch failed';

    if (
      errMsg.includes('Could not read from remote repository') ||
      errMsg.includes('Permission denied') ||
      errMsg.includes('Authentication failed') ||
      errMsg.includes('access to this repository') ||
      errMsg.includes('not have access')
    ) {
      errMsg = 'Access denied: Repository does not exist in workspace or SSH key lacks permission.';
    } else if (errMsg.includes('Could not resolve host') || errMsg.includes('timed out')) {
      errMsg = 'Network error: Unable to reach remote git server.';
    } else if (errMsg.includes('No remote repository specified')) {
      errMsg = 'No remote repository configured for this project.';
    }

    return {
      success: false,
      message: errMsg,
      duration,
      summary,
    };
  }
}

export async function getDetailedStatus(projectPath: string): Promise<DetailedGitStatus> {
  if (!isGitRepo(projectPath)) {
    throw new Error('Not a git repository');
  }

  const [rawStatus, shortStatus, diffStat, branchInfo] = await Promise.all([
    runGitCommand('git status', projectPath).catch(e => e.message),
    runGitCommand('git status --porcelain=v1 -b', projectPath).catch(e => e.message),
    runGitCommand('git diff --stat', projectPath).catch(() => ''),
    runGitCommand('git branch -vv', projectPath).catch(() => ''),
  ]);

  const lines = shortStatus.split('\n').filter(Boolean);
  let branch = 'unknown';
  let tracking = 'None';
  let ahead = 0;
  let behind = 0;
  const files: ChangedFile[] = [];

  for (const line of lines) {
    if (line.startsWith('##')) {
      const header = line.substring(3).trim();
      const match = header.match(/^([^\s\.]+)(\.\.\.([^\s]+))?(?: \[(.*)\])?/);
      if (match) {
        branch = match[1];
        tracking = match[3] || 'None';
        const flags = match[4] || '';
        const aheadMatch = flags.match(/ahead (\d+)/);
        const behindMatch = flags.match(/behind (\d+)/);
        if (aheadMatch) ahead = parseInt(aheadMatch[1], 10);
        if (behindMatch) behind = parseInt(behindMatch[1], 10);
      }
    } else {
      const statusCode = line.substring(0, 2);
      const filePath = line.substring(3).trim();
      let label = 'Modified';
      let type: ChangedFile['type'] = 'modified';

      if (statusCode.includes('?')) {
        label = 'Untracked';
        type = 'untracked';
      } else if (statusCode.includes('A')) {
        label = 'Added';
        type = 'added';
      } else if (statusCode.includes('D')) {
        label = 'Deleted';
        type = 'deleted';
      } else if (statusCode.includes('R')) {
        label = 'Renamed';
        type = 'renamed';
      }

      files.push({
        code: statusCode.trim(),
        label,
        type,
        path: filePath,
      });
    }
  }

  return {
    branch,
    tracking,
    ahead,
    behind,
    clean: files.length === 0,
    filesCount: files.length,
    files,
    rawStatus,
    diffStat: diffStat.trim(),
    branchInfo: branchInfo.trim(),
  };
}

export async function getFileDiff(projectPath: string, filePath: string): Promise<string> {
  if (!isGitRepo(projectPath)) return '';
  try {
    const diff = await runGitCommand(`git diff -- "${filePath}"`, projectPath);
    if (!diff) {
      // Check cached/staged diff
      return await runGitCommand(`git diff --cached -- "${filePath}"`, projectPath);
    }
    return diff;
  } catch {
    return '';
  }
}

export async function getRecentCommits(projectPath: string, count = 8): Promise<any[]> {
  if (!isGitRepo(projectPath)) return [];
  try {
    const output = await runGitCommand(`git log -${count} --format="%h|%s|%an|%cr"`, projectPath);
    return output.split('\n').filter(Boolean).map(line => {
      const [hash, message, author, timeAgo] = line.split('|');
      return { hash, message, author, timeAgo };
    });
  } catch {
    return [];
  }
}

export async function getGitRemotes(projectPath: string): Promise<{ name: string; url: string }[]> {
  if (!isGitRepo(projectPath)) return [];
  try {
    const output = await runGitCommand('git remote -v', projectPath);
    const remotesMap = new Map<string, string>();
    output.split('\n').filter(Boolean).forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        remotesMap.set(parts[0], parts[1]);
      }
    });
    return Array.from(remotesMap.entries()).map(([name, url]) => ({ name, url }));
  } catch {
    return [];
  }
}

