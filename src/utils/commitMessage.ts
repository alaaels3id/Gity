import { ChangedFile } from '../types';

function cleanFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  const base = parts[parts.length - 1] || filePath;
  // Keep extension for config, documentation, stylesheets
  if (/(\.json|\.md|\.css|\.scss|\.yml|\.yaml|\.xml|\.env.*)$/i.test(base)) {
    return base;
  }
  // Clean code extension for clean readable commit message
  return base.replace(/\.(blade\.php|[a-zA-Z0-9]+)$/i, '');
}

function formatFileList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function detectScope(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.includes('component') || lower.includes('views/') || lower.includes('pages/')) return 'ui';
  if (lower.includes('electron/') || lower.includes('main.ts') || lower.includes('preload.')) return 'electron';
  if (lower.includes('controller')) return 'api';
  if (lower.includes('model')) return 'models';
  if (lower.includes('migration') || lower.includes('database/')) return 'database';
  if (lower.includes('routes/') || lower.includes('routes.')) return 'routes';
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.includes('styles/')) return 'styles';
  if (lower.includes('test') || lower.includes('spec')) return 'test';
  if (lower.endsWith('.md') || lower.includes('docs/')) return 'docs';
  if (lower.includes('context/') || lower.includes('store/')) return 'state';
  if (lower.includes('locale') || lower.includes('translation') || lower.includes('language')) return 'i18n';
  if (lower.includes('config') || lower.includes('package.json') || lower.includes('composer.json')) return 'config';
  if (lower.includes('service') || lower.includes('utils/')) return 'core';
  return '';
}

function detectType(files: ChangedFile[], branch?: string): string {
  if (branch) {
    const bLower = branch.toLowerCase();
    if (bLower.startsWith('fix/') || bLower.startsWith('bugfix/') || bLower.startsWith('hotfix/')) return 'fix';
    if (bLower.startsWith('feat/') || bLower.startsWith('feature/')) return 'feat';
    if (bLower.startsWith('chore/')) return 'chore';
    if (bLower.startsWith('refactor/')) return 'refactor';
    if (bLower.startsWith('docs/')) return 'docs';
    if (bLower.startsWith('style/')) return 'style';
  }

  const allAdded = files.every(f => f.type === 'added' || f.type === 'untracked');
  if (allAdded) return 'feat';

  const allDeleted = files.every(f => f.type === 'deleted');
  if (allDeleted) return 'chore';

  const allDocs = files.every(f => f.path.endsWith('.md') || f.path.toLowerCase().includes('docs/'));
  if (allDocs) return 'docs';

  const allStyles = files.every(f => f.path.endsWith('.css') || f.path.endsWith('.scss'));
  if (allStyles) return 'style';

  const allTests = files.every(f => f.path.includes('test') || f.path.includes('spec'));
  if (allTests) return 'test';

  const allConfigs = files.every(f => {
    const l = f.path.toLowerCase();
    return l.includes('package.json') || l.includes('composer.json') || l.includes('tsconfig') || l.includes('config');
  });
  if (allConfigs) return 'chore';

  return 'feat';
}

/**
 * Generate a descriptive commit message based on modified files, types, and branch.
 * Supports multiple formatting styles (conventional, action-oriented, and bulleted).
 */
export function generateCommitMessage(
  files: ChangedFile[] = [],
  branch?: string,
  styleIndex = 0
): string {
  if (!files || files.length === 0) {
    return 'chore: update project files';
  }

  const type = detectType(files, branch);
  const fileNames = files.map(f => cleanFileName(f.path));
  const scopes = Array.from(new Set(files.map(f => detectScope(f.path)).filter(Boolean)));
  const primaryScope = scopes.length === 1 ? scopes[0] : scopes.length > 0 && scopes.length <= 2 ? scopes.join('/') : '';
  const scopeStr = primaryScope ? `(${primaryScope})` : '';

  const styles: string[] = [];

  // Style 1: Conventional Commits
  if (files.length === 1) {
    const f = files[0];
    const name = cleanFileName(f.path);
    const action = f.type === 'added' || f.type === 'untracked' ? 'add' : f.type === 'deleted' ? 'remove' : 'update';
    styles.push(`${type}${scopeStr}: ${action} ${name}`);
  } else if (files.length <= 3) {
    styles.push(`${type}${scopeStr}: update ${formatFileList(fileNames)}`);
  } else {
    const top2 = fileNames.slice(0, 2).join(', ');
    const restCount = files.length - 2;
    styles.push(`${type}${scopeStr}: update ${top2}, and ${restCount} other files`);
  }

  // Style 2: Action-oriented Summary
  if (files.length === 1) {
    const f = files[0];
    const name = cleanFileName(f.path);
    const verb = f.type === 'added' || f.type === 'untracked' ? 'Add' : f.type === 'deleted' ? 'Remove' : 'Update';
    styles.push(`${verb} ${name}`);
  } else if (files.length <= 3) {
    styles.push(`Update ${formatFileList(fileNames)}`);
  } else {
    styles.push(`Update ${files.length} files (${formatFileList(fileNames.slice(0, 3))}...)`);
  }

  // Style 3: Detailed Bulleted Message
  const bulletLines = files.slice(0, 6).map(f => {
    const prefix = f.type === 'added' || f.type === 'untracked' ? 'Add' : f.type === 'deleted' ? 'Delete' : 'Update';
    return `- ${prefix} ${cleanFileName(f.path)}`;
  });
  if (files.length > 6) {
    bulletLines.push(`- and ${files.length - 6} other files`);
  }
  styles.push(`${type}${scopeStr}: update ${files.length} modified files\n\n${bulletLines.join('\n')}`);

  const chosenIndex = ((styleIndex % styles.length) + styles.length) % styles.length;
  return styles[chosenIndex];
}
