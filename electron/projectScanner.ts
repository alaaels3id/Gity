import * as fs from 'fs';
import * as path from 'path';
import { getGitSummary, getDetailedStatus, getRecentCommits, getGitRemotes } from './gitService';
import { ProjectItem, ProjectDetails } from './types';

export function detectLaravel(dirPath: string): {
  isLaravel: boolean;
  laravelVersion: string | null;
  phpVersion: string | null;
} {
  const artisanPath = path.join(dirPath, 'artisan');
  const composerPath = path.join(dirPath, 'composer.json');

  const hasArtisan = fs.existsSync(artisanPath);
  let isLaravel = hasArtisan;
  let laravelVersion: string | null = null;
  let phpVersion: string | null = null;

  if (fs.existsSync(composerPath)) {
    try {
      const composerContent = fs.readFileSync(composerPath, 'utf8');
      const composer = JSON.parse(composerContent);

      const requires = { ...(composer.require || {}), ...(composer['require-dev'] || {}) };
      if (requires['laravel/framework']) {
        isLaravel = true;
        laravelVersion = requires['laravel/framework'];
      }
      if (requires['php']) {
        phpVersion = requires['php'];
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  return {
    isLaravel,
    laravelVersion,
    phpVersion,
  };
}

export async function scanDirectory(folderPath: string, customRootName?: string): Promise<ProjectItem[]> {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
  const directories = entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const rootName = customRootName || path.basename(folderPath);
  const batchSize = 6;
  const results: ProjectItem[] = [];

  for (let i = 0; i < directories.length; i += batchSize) {
    const batch = directories.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async name => {
        const fullPath = path.join(folderPath, name);
        const laravelInfo = detectLaravel(fullPath);
        const gitInfo = await getGitSummary(fullPath);

        return {
          id: `${rootName}_${name}`,
          name,
          path: fullPath,
          rootPath: folderPath,
          rootFolderName: rootName,
          isLaravel: laravelInfo.isLaravel,
          laravelVersion: laravelInfo.laravelVersion,
          phpVersion: laravelInfo.phpVersion,
          ...gitInfo,
        };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

export async function scanMultipleDirectories(folderPaths: string[]): Promise<ProjectItem[]> {
  const allResults: ProjectItem[] = [];
  const seenPaths = new Set<string>();

  for (const fp of folderPaths) {
    const trimmed = (fp || '').trim();
    if (!trimmed || !fs.existsSync(trimmed)) continue;

    try {
      const items = await scanDirectory(trimmed, path.basename(trimmed));
      for (const item of items) {
        if (!seenPaths.has(item.path)) {
          seenPaths.add(item.path);
          allResults.push(item);
        }
      }
    } catch (err) {
      console.warn(`Could not scan directory ${trimmed}:`, err);
    }
  }

  return allResults.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export async function getProjectFullDetails(projectPath: string): Promise<ProjectDetails> {
  const name = path.basename(projectPath);
  const laravelInfo = detectLaravel(projectPath);
  const [gitSummary, gitStatus, recentCommits, remotes] = await Promise.all([
    getGitSummary(projectPath),
    getDetailedStatus(projectPath).catch(() => ({
      branch: 'none',
      tracking: 'none',
      ahead: 0,
      behind: 0,
      clean: true,
      filesCount: 0,
      files: [],
      rawStatus: 'No git repository detected',
      diffStat: '',
      branchInfo: '',
    })),
    getRecentCommits(projectPath, 8),
    getGitRemotes(projectPath),
  ]);

  let envInfo = undefined;
  const envPath = path.join(projectPath, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      const envMap: Record<string, string> = {};
      lines.forEach(l => {
        const match = l.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match) {
          envMap[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      });
      envInfo = {
        appName: envMap['APP_NAME'] || name,
        appEnv: envMap['APP_ENV'] || 'local',
        dbConnection: envMap['DB_CONNECTION'] || 'sqlite',
      };
    } catch {}
  }

  let composerInfo = undefined;
  const composerPath = path.join(projectPath, 'composer.json');
  if (fs.existsSync(composerPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
      composerInfo = {
        description: parsed.description,
        dependenciesCount: Object.keys(parsed.require || {}).length,
        phpVersion: parsed.require?.php,
      };
    } catch {}
  }

  const project: ProjectItem = {
    id: name,
    name,
    path: projectPath,
    isLaravel: laravelInfo.isLaravel,
    laravelVersion: laravelInfo.laravelVersion,
    phpVersion: laravelInfo.phpVersion,
    ...gitSummary,
  };

  return {
    project,
    status: gitStatus,
    recentCommits,
    remotes,
    envInfo,
    composerInfo,
  };
}
