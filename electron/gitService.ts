import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { GitSummary, DetailedGitStatus, FetchResult, PullResult, RemoteResult, ChangedFile, CheckoutResult, ResetResult } from './types';

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

export async function pullProject(projectPath: string): Promise<PullResult> {
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
    const stdout = await runGitCommand('git pull', projectPath, 45000);
    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const updatedSummary = await getGitSummary(projectPath);

    return {
      success: true,
      message: stdout || 'Already up to date.',
      duration,
      summary: updatedSummary,
    };
  } catch (err: any) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const summary = await getGitSummary(projectPath);
    let errMsg = err.message || 'Git pull failed';

    if (
      errMsg.includes('Please commit your changes or stash them before you merge') ||
      errMsg.includes('Your local changes to the following files would be overwritten by merge')
    ) {
      errMsg = 'Pull failed: Uncommitted local changes would be overwritten. Please commit or stash your changes.';
    } else if (errMsg.includes('Automatic merge failed') || errMsg.includes('CONFLICT')) {
      errMsg = 'Pull failed: Merge conflicts detected. Resolve conflicts before proceeding.';
    } else if (errMsg.includes('There is no tracking information for the current branch') || errMsg.includes('no tracking info')) {
      errMsg = 'Pull failed: No upstream branch configured for the current branch.';
    } else if (
      errMsg.includes('Could not read from remote repository') ||
      errMsg.includes('Permission denied') ||
      errMsg.includes('Authentication failed') ||
      errMsg.includes('access to this repository') ||
      errMsg.includes('not have access')
    ) {
      errMsg = 'Access denied: Unable to read from remote repository. Check credentials or SSH keys.';
    } else if (errMsg.includes('Could not resolve host') || errMsg.includes('timed out')) {
      errMsg = 'Network error: Unable to reach remote git server.';
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

export async function setRemoteUrl(projectPath: string, remoteName: string, newUrl: string): Promise<RemoteResult> {
  if (!isGitRepo(projectPath)) {
    return { success: false, message: 'Not a git repository' };
  }

  const trimmedName = (remoteName || 'origin').trim();
  const trimmedUrl = (newUrl || '').trim();

  if (!trimmedUrl) {
    return { success: false, message: 'Remote URL cannot be empty' };
  }

  try {
    const existingRemotes = await getGitRemotes(projectPath);
    const exists = existingRemotes.some(r => r.name === trimmedName);

    if (exists) {
      await runGitCommand(`git remote set-url ${trimmedName} "${trimmedUrl}"`, projectPath);
    } else {
      await runGitCommand(`git remote add ${trimmedName} "${trimmedUrl}"`, projectPath);
    }

    const updatedRemotes = await getGitRemotes(projectPath);
    return {
      success: true,
      message: `Successfully updated remote "${trimmedName}" to ${trimmedUrl}`,
      remotes: updatedRemotes,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to update remote URL',
    };
  }
}

export async function getProjectBranches(projectPath: string): Promise<string[]> {
  if (!isGitRepo(projectPath)) return [];
  try {
    // 1. Get all local branches
    const localOutput = await runGitCommand('git branch --format="%(refname:short)"', projectPath).catch(() => '');
    const localBranches = localOutput.split('\n').map(b => b.trim()).filter(Boolean);

    // 2. Get remote branches (e.g. origin/feature)
    const remoteOutput = await runGitCommand('git branch -r --format="%(refname:short)"', projectPath).catch(() => '');
    const remoteBranches = remoteOutput
      .split('\n')
      .map(b => b.trim())
      .filter(b => b && !b.includes('/HEAD'));

    const branchSet = new Set<string>(localBranches);

    // Add unique remote branch names without remote prefix if not present locally
    for (const rb of remoteBranches) {
      const slashIndex = rb.indexOf('/');
      const cleanName = slashIndex !== -1 ? rb.substring(slashIndex + 1) : rb;
      if (!branchSet.has(cleanName)) {
        branchSet.add(cleanName);
      }
    }

    // Ensure active branch is included
    const activeBranch = await runGitCommand('git rev-parse --abbrev-ref HEAD', projectPath).catch(() => '');
    const cleanActive = activeBranch.trim();
    if (cleanActive && cleanActive !== 'HEAD' && !branchSet.has(cleanActive)) {
      branchSet.add(cleanActive);
    }

    // Sort with current/main/master first or alphabetical
    const sorted = Array.from(branchSet).sort((a, b) => {
      if (a === cleanActive) return -1;
      if (b === cleanActive) return 1;
      if (a === 'main' || a === 'master') return -1;
      if (b === 'main' || b === 'master') return 1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });

    return sorted;
  } catch {
    return [];
  }
}

export async function checkoutBranch(projectPath: string, branchName: string): Promise<CheckoutResult> {
  if (!isGitRepo(projectPath)) {
    return {
      success: false,
      branch: branchName,
      message: 'Not a git repository',
    };
  }

  const cleanBranch = (branchName || '').trim();
  if (!cleanBranch) {
    return {
      success: false,
      branch: branchName,
      message: 'Branch name cannot be empty',
    };
  }

  // Safety validation against flag options or command injection
  if (cleanBranch.startsWith('-') || /[\s;`$|&><]/.test(cleanBranch)) {
    return {
      success: false,
      branch: cleanBranch,
      message: `Invalid branch name: ${cleanBranch}`,
    };
  }

  try {
    const stdout = await runGitCommand(`git checkout "${cleanBranch}"`, projectPath);
    const summary = await getGitSummary(projectPath);
    return {
      success: true,
      branch: summary.branch || cleanBranch,
      message: stdout || `Switched to branch '${cleanBranch}'`,
      summary,
    };
  } catch (err: any) {
    let errMsg = err.message || 'Checkout failed';
    if (errMsg.includes('Your local changes to the following files would be overwritten')) {
      errMsg = 'Checkout failed: Local changes would be overwritten. Please commit, stash, or discard changes first.';
    } else if (errMsg.includes('did not match any file(s) known to git')) {
      errMsg = `Branch '${cleanBranch}' not found.`;
    }
    return {
      success: false,
      branch: cleanBranch,
      message: errMsg,
    };
  }
}

export async function resetProjectChanges(
  projectPath: string,
  options: { filePath?: string; includeUntracked?: boolean } = {}
): Promise<ResetResult> {
  if (!isGitRepo(projectPath)) {
    return {
      success: false,
      message: 'Not a git repository',
    };
  }

  const { filePath, includeUntracked = true } = options;

  try {
    if (filePath) {
      const cleanPath = filePath.trim();
      if (!cleanPath || cleanPath.startsWith('-') || /[\r\n]/.test(cleanPath)) {
        return { success: false, message: 'Invalid file path' };
      }

      // Check if file is untracked
      const statusLine = await runGitCommand(`git status --porcelain -- "${cleanPath}"`, projectPath).catch(() => '');
      if (statusLine.startsWith('??')) {
        // Untracked file: remove via git clean, or direct unlink fallback
        await runGitCommand(`git clean -f -- "${cleanPath}"`, projectPath).catch(async () => {
          const fullPath = path.resolve(projectPath, cleanPath);
          if (fullPath.startsWith(projectPath) && fs.existsSync(fullPath)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        });
      } else {
        // Tracked modified/staged/deleted file: unstage and restore to HEAD
        await runGitCommand(`git reset HEAD -- "${cleanPath}"`, projectPath).catch(() => {});
        await runGitCommand(`git checkout HEAD -- "${cleanPath}"`, projectPath);
      }

      const summary = await getGitSummary(projectPath);
      return {
        success: true,
        message: `Discarded changes for ${cleanPath}`,
        summary,
      };
    } else {
      // Discard all changes in repository
      // 1. Reset all staged and unstaged tracked changes to HEAD
      await runGitCommand('git reset --hard HEAD', projectPath);

      // 2. Remove untracked files & directories if requested
      if (includeUntracked) {
        await runGitCommand('git clean -fd', projectPath);
      }

      const summary = await getGitSummary(projectPath);
      return {
        success: true,
        message: 'All uncommitted changes have been reset.',
        summary,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to reset changes',
    };
  }
}


