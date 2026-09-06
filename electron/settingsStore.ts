import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { AppSettings } from './types';

export function getDefaultProjectsPath(): string {
  try {
    const home = app.getPath('home');
    const candidates = [
      path.join(home, 'code'),
      path.join(home, 'Projects'),
      path.join(home, 'Documents', 'Projects'),
      path.join(home, 'Documents'),
      home,
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return home;
  } catch {
    return process.platform === 'win32' ? 'C:\\' : '/';
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  projectsPaths: [],
  projectsPath: '',
  editor: 'code',
  theme: 'dark',
};

function getConfigFile(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'gity-settings.json');
}

export function loadSettings(): AppSettings {
  const defaultDir = getDefaultProjectsPath();
  try {
    const configFile = getConfigFile();
    if (fs.existsSync(configFile)) {
      const data = fs.readFileSync(configFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Normalize projectsPaths
      let paths: string[] = [];
      if (Array.isArray(parsed.projectsPaths) && parsed.projectsPaths.length > 0) {
        paths = parsed.projectsPaths.filter((p: any) => typeof p === 'string' && p.trim().length > 0);
      } else if (typeof parsed.projectsPath === 'string' && parsed.projectsPath.trim().length > 0) {
        paths = [parsed.projectsPath.trim()];
      }

      // If on Windows and setting was the default hardcoded mac path, migrate it
      if (process.platform === 'win32') {
        paths = paths.map(p => (p === '/Users/alaaelsaid/code' ? defaultDir : p));
      }

      if (paths.length === 0) {
        paths = [defaultDir];
      }

      // Unique paths
      paths = Array.from(new Set(paths));

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        projectsPaths: paths,
        projectsPath: paths[0] || defaultDir,
      };
    }
  } catch (err) {
    console.error('Failed to load settings, using defaults:', err);
  }
  return {
    ...DEFAULT_SETTINGS,
    projectsPaths: [defaultDir],
    projectsPath: defaultDir,
  };
}

export function saveSettings(newSettings: Partial<AppSettings>): AppSettings {
  try {
    const configFile = getConfigFile();
    const current = loadSettings();
    
    let updatedPaths = current.projectsPaths;
    if (Array.isArray(newSettings.projectsPaths)) {
      updatedPaths = Array.from(new Set(newSettings.projectsPaths.filter(p => typeof p === 'string' && p.trim().length > 0)));
    } else if (newSettings.projectsPath && !newSettings.projectsPaths) {
      updatedPaths = Array.from(new Set([...current.projectsPaths, newSettings.projectsPath.trim()]));
    }

    if (updatedPaths.length === 0) {
      updatedPaths = [getDefaultProjectsPath()];
    }

    const merged: AppSettings = {
      ...current,
      ...newSettings,
      projectsPaths: updatedPaths,
      projectsPath: updatedPaths[0],
    };

    fs.writeFileSync(configFile, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (err) {
    console.error('Failed to save settings:', err);
    throw err;
  }
}
