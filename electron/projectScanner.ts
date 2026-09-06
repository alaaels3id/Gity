import * as fs from 'fs';
import * as path from 'path';
import { getGitSummary, getDetailedStatus, getRecentCommits, getGitRemotes, getProjectBranches } from './gitService';
import { ProjectItem, ProjectDetails, ProjectType } from './types';

export interface DetectedTech {
  isLaravel: boolean;
  laravelVersion: string | null;
  phpVersion: string | null;
  projectType: ProjectType;
  projectTypeLabel: string;
  framework: string | null;
  frameworkVersion: string | null;
  language: string;
}

export function detectProjectType(dirPath: string): DetectedTech {
  const artisanPath = path.join(dirPath, 'artisan');
  const composerPath = path.join(dirPath, 'composer.json');
  const packagePath = path.join(dirPath, 'package.json');

  // 1. Check Laravel first (artisan or composer.json requiring laravel/framework)
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
    } catch {}
  }

  if (isLaravel) {
    return {
      isLaravel: true,
      laravelVersion,
      phpVersion,
      projectType: 'laravel',
      projectTypeLabel: 'Laravel',
      framework: 'Laravel',
      frameworkVersion: laravelVersion,
      language: 'PHP',
    };
  }

  // 2. JavaScript / TypeScript / Node.js
  if (fs.existsSync(packagePath)) {
    let framework: string | null = null;
    let frameworkVersion: string | null = null;
    let isTypeScript = fs.existsSync(path.join(dirPath, 'tsconfig.json'));

    try {
      const pkgContent = fs.readFileSync(packagePath, 'utf8');
      const pkg = JSON.parse(pkgContent);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (allDeps['typescript']) isTypeScript = true;

      if (allDeps['next']) { framework = 'Next.js'; frameworkVersion = allDeps['next']; }
      else if (allDeps['nuxt']) { framework = 'Nuxt'; frameworkVersion = allDeps['nuxt']; }
      else if (allDeps['@sveltejs/kit'] || allDeps['svelte']) { framework = 'Svelte'; frameworkVersion = allDeps['@sveltejs/kit'] || allDeps['svelte']; }
      else if (allDeps['astro']) { framework = 'Astro'; frameworkVersion = allDeps['astro']; }
      else if (allDeps['@remix-run/react']) { framework = 'Remix'; frameworkVersion = allDeps['@remix-run/react']; }
      else if (allDeps['vue']) { framework = 'Vue'; frameworkVersion = allDeps['vue']; }
      else if (allDeps['react'] || allDeps['react-dom']) { framework = 'React'; frameworkVersion = allDeps['react'] || allDeps['react-dom']; }
      else if (allDeps['@angular/core']) { framework = 'Angular'; frameworkVersion = allDeps['@angular/core']; }
      else if (allDeps['electron']) { framework = 'Electron'; frameworkVersion = allDeps['electron']; }
      else if (allDeps['@nestjs/core']) { framework = 'NestJS'; frameworkVersion = allDeps['@nestjs/core']; }
      else if (allDeps['express']) { framework = 'Express'; frameworkVersion = allDeps['express']; }
      else if (allDeps['fastify']) { framework = 'Fastify'; frameworkVersion = allDeps['fastify']; }
      else if (allDeps['vite']) { framework = 'Vite'; frameworkVersion = allDeps['vite']; }
      else { framework = 'Node.js'; }
    } catch {}

    const projectType = isTypeScript ? 'typescript' : 'javascript';
    const language = isTypeScript ? 'TypeScript' : 'JavaScript';
    const projectTypeLabel = framework || language;

    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType,
      projectTypeLabel,
      framework,
      frameworkVersion,
      language,
    };
  }

  // 3. Python
  const pythonMarkers = [
    'requirements.txt',
    'pyproject.toml',
    'Pipfile',
    'setup.py',
    'manage.py',
    'poetry.lock',
    'environment.yml',
    'Pipfile.lock',
    'main.py',
    'app.py',
  ];
  const hasPython = pythonMarkers.some(file => fs.existsSync(path.join(dirPath, file)));
  if (hasPython) {
    let framework: string | null = null;
    if (fs.existsSync(path.join(dirPath, 'manage.py'))) {
      framework = 'Django';
    } else {
      const reqPath = path.join(dirPath, 'requirements.txt');
      const pyprojectPath = path.join(dirPath, 'pyproject.toml');
      let content = '';
      if (fs.existsSync(reqPath)) {
        try { content += fs.readFileSync(reqPath, 'utf8').toLowerCase(); } catch {}
      }
      if (fs.existsSync(pyprojectPath)) {
        try { content += fs.readFileSync(pyprojectPath, 'utf8').toLowerCase(); } catch {}
      }
      if (content.includes('django')) framework = 'Django';
      else if (content.includes('fastapi')) framework = 'FastAPI';
      else if (content.includes('flask')) framework = 'Flask';
      else if (content.includes('streamlit')) framework = 'Streamlit';
    }

    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType: 'python',
      projectTypeLabel: framework || 'Python',
      framework,
      frameworkVersion: null,
      language: 'Python',
    };
  }

  // 4. Go
  if (fs.existsSync(path.join(dirPath, 'go.mod')) || fs.existsSync(path.join(dirPath, 'main.go'))) {
    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType: 'go',
      projectTypeLabel: 'Go',
      framework: null,
      frameworkVersion: null,
      language: 'Go',
    };
  }

  // 5. Rust
  if (fs.existsSync(path.join(dirPath, 'Cargo.toml'))) {
    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType: 'rust',
      projectTypeLabel: 'Rust',
      framework: null,
      frameworkVersion: null,
      language: 'Rust',
    };
  }

  // 6. Generic PHP
  if (fs.existsSync(composerPath) || fs.existsSync(path.join(dirPath, 'index.php'))) {
    let framework: string | null = null;
    if (fs.existsSync(composerPath)) {
      try {
        const raw = fs.readFileSync(composerPath, 'utf8');
        if (raw.includes('symfony/')) framework = 'Symfony';
        else if (raw.includes('wordpress')) framework = 'WordPress';
      } catch {}
    }
    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion,
      projectType: 'php',
      projectTypeLabel: framework || 'PHP',
      framework,
      frameworkVersion: null,
      language: 'PHP',
    };
  }

  // 7. Java / Kotlin
  if (
    fs.existsSync(path.join(dirPath, 'pom.xml')) ||
    fs.existsSync(path.join(dirPath, 'build.gradle')) ||
    fs.existsSync(path.join(dirPath, 'build.gradle.kts'))
  ) {
    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType: 'java',
      projectTypeLabel: 'Java',
      framework: null,
      frameworkVersion: null,
      language: 'Java',
    };
  }

  // 8. Ruby
  if (fs.existsSync(path.join(dirPath, 'Gemfile'))) {
    let framework: string | null = null;
    try {
      const gem = fs.readFileSync(path.join(dirPath, 'Gemfile'), 'utf8');
      if (gem.includes('rails')) framework = 'Rails';
    } catch {}
    return {
      isLaravel: false,
      laravelVersion: null,
      phpVersion: null,
      projectType: 'ruby',
      projectTypeLabel: framework || 'Ruby',
      framework,
      frameworkVersion: null,
      language: 'Ruby',
    };
  }

  return {
    isLaravel: false,
    laravelVersion: null,
    phpVersion: null,
    projectType: 'other',
    projectTypeLabel: 'Other',
    framework: null,
    frameworkVersion: null,
    language: 'Other',
  };
}

export function detectLaravel(dirPath: string): {
  isLaravel: boolean;
  laravelVersion: string | null;
  phpVersion: string | null;
} {
  const info = detectProjectType(dirPath);
  return {
    isLaravel: info.isLaravel,
    laravelVersion: info.laravelVersion,
    phpVersion: info.phpVersion,
  };
}

export async function scanDirectory(folderPath: string, customRootName?: string): Promise<ProjectItem[]> {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return [];
    }

    const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
    const directories = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const rootName = customRootName || path.basename(folderPath) || folderPath;
    const safeRootId = (rootName || 'root').replace(/[:\\/]/g, '_');
    const batchSize = 6;
    const results: ProjectItem[] = [];

    for (let i = 0; i < directories.length; i += batchSize) {
      const batch = directories.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async name => {
          const fullPath = path.join(folderPath, name);
          const techInfo = detectProjectType(fullPath);
          const [gitInfo, branches] = await Promise.all([
            getGitSummary(fullPath),
            getProjectBranches(fullPath),
          ]);

          return {
            id: `${safeRootId}_${name}`,
            name,
            path: fullPath,
            rootPath: folderPath,
            rootFolderName: rootName,
            isLaravel: techInfo.isLaravel,
            laravelVersion: techInfo.laravelVersion,
            phpVersion: techInfo.phpVersion,
            projectType: techInfo.projectType,
            projectTypeLabel: techInfo.projectTypeLabel,
            framework: techInfo.framework,
            frameworkVersion: techInfo.frameworkVersion,
            language: techInfo.language,
            isGit: gitInfo.isGit,
            branch: gitInfo.branch,
            clean: gitInfo.clean,
            modifiedCount: gitInfo.modifiedCount,
            ahead: gitInfo.ahead,
            behind: gitInfo.behind,
            lastCommit: gitInfo.lastCommit,
            branches,
          };
        })
      );
      results.push(...batchResults);
    }

    return results;
  } catch {
    return [];
  }
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
  const techInfo = detectProjectType(projectPath);
  const [gitSummary, gitStatus, recentCommits, remotes, branches] = await Promise.all([
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
    getProjectBranches(projectPath),
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

  let packageInfo = undefined;
  const packagePath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
      packageInfo = {
        description: parsed.description,
        dependenciesCount: Object.keys(allDeps).length,
        framework: techInfo.framework || undefined,
        version: parsed.version,
      };
    } catch {}
  }

  const project: ProjectItem = {
    id: name,
    name,
    path: projectPath,
    isLaravel: techInfo.isLaravel,
    laravelVersion: techInfo.laravelVersion,
    phpVersion: techInfo.phpVersion,
    projectType: techInfo.projectType,
    projectTypeLabel: techInfo.projectTypeLabel,
    framework: techInfo.framework,
    frameworkVersion: techInfo.frameworkVersion,
    language: techInfo.language,
    branches,
    ...gitSummary,
  };

  return {
    project,
    status: gitStatus,
    recentCommits,
    remotes,
    branches,
    envInfo,
    composerInfo,
    packageInfo,
    projectType: techInfo.projectType,
    projectTypeLabel: techInfo.projectTypeLabel,
    framework: techInfo.framework,
    frameworkVersion: techInfo.frameworkVersion,
    language: techInfo.language,
  };
}
