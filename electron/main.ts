import { app, BrowserWindow, ipcMain, shell, dialog, Notification, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec, execFile } from 'child_process';
import { loadSettings, saveSettings, getDefaultProjectsPath } from './settingsStore';
import { scanDirectory, scanMultipleDirectories, getProjectFullDetails } from './projectScanner';
import { fetchRemote, pullProject, pushProject, commitAndPush, getDetailedStatus, getFileDiff, getProjectBranches, checkoutBranch, setRemoteUrl, resetProjectChanges } from './gitService';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconCandidates = [
    path.join(process.resourcesPath, 'icon.png'),
    path.join(app.getAppPath(), 'build/icon.png'),
    path.join(app.getAppPath(), 'build/icon.ico'),
  ];
  const iconPath = iconCandidates.find(p => fs.existsSync(p));
  const hasIcon = Boolean(iconPath);

  if (process.platform === 'darwin' && app.dock && iconPath) {
    try {
      app.dock.setIcon(iconPath);
    } catch {
      // Ignored
    }
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 850,
    minHeight: 550,
    title: 'Gity - Laravel & Git Workspace',
    icon: iconPath,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 18, y: 18 } }
      : {
          titleBarOverlay: {
            color: '#090d16',
            symbolColor: '#94a3b8',
            height: 38,
          },
        }),
    backgroundColor: '#090d16',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Safety fallback: ensure window is always displayed even if ready-to-show is delayed
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 1500);

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => {
      console.error('Failed to load index.html:', err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle('settings:get', async () => {
    return loadSettings();
  });

  ipcMain.handle('settings:save', async (_, newSettings) => {
    return saveSettings(newSettings);
  });

  ipcMain.handle('dialog:select-folder', async (_, currentPath) => {
    if (!mainWindow) return null;
    const defaultDir = currentPath || getDefaultProjectsPath();
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Projects Directory',
      defaultPath: defaultDir,
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('projects:scan', async (_, folderPaths) => {
    try {
      const settings = loadSettings();
      let pathsToScan: string[] = [];

      if (Array.isArray(folderPaths) && folderPaths.length > 0) {
        pathsToScan = folderPaths;
      } else if (typeof folderPaths === 'string' && folderPaths.trim()) {
        pathsToScan = [folderPaths.trim()];
      } else if (settings.projectsPaths && settings.projectsPaths.length > 0) {
        pathsToScan = settings.projectsPaths;
      } else if (settings.projectsPath) {
        pathsToScan = [settings.projectsPath];
      } else {
        pathsToScan = [getDefaultProjectsPath()];
      }

      return await scanMultipleDirectories(pathsToScan);
    } catch {
      return [];
    }
  });

  ipcMain.handle('projects:open-location', async (_, projectPath) => {
    const err = await shell.openPath(projectPath);
    if (err) {
      throw new Error(`Could not open path: ${err}`);
    }
    return true;
  });

  ipcMain.handle('projects:fetch', async (_, projectPath) => {
    return await fetchRemote(projectPath);
  });

  ipcMain.handle('projects:pull', async (_, projectPath) => {
    return await pullProject(projectPath);
  });

  ipcMain.handle('projects:push', async (_, { projectPath, force = false }) => {
    return await pushProject(projectPath, { force });
  });

  ipcMain.handle('projects:commit-and-push', async (_, { projectPath, message, files }) => {
    return await commitAndPush(projectPath, message, files);
  });

  ipcMain.handle('projects:status', async (_, projectPath) => {
    return await getDetailedStatus(projectPath);
  });

  ipcMain.handle('projects:details', async (_, projectPath) => {
    return await getProjectFullDetails(projectPath);
  });

  ipcMain.handle('projects:file-diff', async (_, { projectPath, filePath }) => {
    return await getFileDiff(projectPath, filePath);
  });

  ipcMain.handle('projects:open-editor', async (_, { projectPath, editor = 'code' }) => {
    const isMac = process.platform === 'darwin';
    const isWin = process.platform === 'win32';

    // Augmented PATH so CLI tools installed in /usr/local/bin or homebrew can be found
    const env = {
      ...process.env,
      PATH: [
        '/usr/local/bin',
        '/opt/homebrew/bin',
        '/opt/homebrew/sbin',
        process.env.PATH || '',
      ].filter(Boolean).join(isWin ? ';' : ':'),
    };

    const candidates: string[] = [];
    const normalized = (editor || 'code').toLowerCase().trim();

    if (isMac) {
      if (normalized === 'phpstorm' || normalized === 'pstorm') {
        candidates.push(`open -a "PhpStorm" "${projectPath}"`);
        candidates.push(`pstorm "${projectPath}"`);
        candidates.push(`phpstorm "${projectPath}"`);
      } else if (normalized === 'cursor') {
        candidates.push(`open -a "Cursor" "${projectPath}"`);
        candidates.push(`cursor "${projectPath}"`);
      } else if (normalized === 'code' || normalized === 'vscode') {
        candidates.push(`open -a "Visual Studio Code" "${projectPath}"`);
        candidates.push(`code "${projectPath}"`);
      } else if (normalized === 'subl' || normalized === 'sublime') {
        candidates.push(`open -a "Sublime Text" "${projectPath}"`);
        candidates.push(`subl "${projectPath}"`);
      } else {
        candidates.push(`open -a "${editor}" "${projectPath}"`);
        candidates.push(`${editor} "${projectPath}"`);
      }
    } else if (isWin) {
      if (normalized === 'phpstorm' || normalized === 'pstorm') {
        candidates.push(`phpstorm64 "${projectPath}"`);
        candidates.push(`pstorm "${projectPath}"`);
      } else if (normalized === 'code') {
        candidates.push(`code "${projectPath}"`);
      } else if (normalized === 'cursor') {
        candidates.push(`cursor "${projectPath}"`);
      } else if (normalized === 'subl') {
        candidates.push(`subl "${projectPath}"`);
      } else {
        candidates.push(`${editor} "${projectPath}"`);
      }
    } else {
      if (normalized === 'phpstorm' || normalized === 'pstorm') {
        candidates.push(`pstorm "${projectPath}"`);
        candidates.push(`phpstorm "${projectPath}"`);
      } else if (normalized === 'code') {
        candidates.push(`code "${projectPath}"`);
      } else if (normalized === 'cursor') {
        candidates.push(`cursor "${projectPath}"`);
      } else if (normalized === 'subl') {
        candidates.push(`subl "${projectPath}"`);
      } else {
        candidates.push(`${editor} "${projectPath}"`);
      }
    }

    return new Promise((resolve, reject) => {
      let index = 0;
      const tryNext = (lastErr?: any) => {
        if (index >= candidates.length) {
          return reject(lastErr || new Error(`Failed to launch editor (${editor})`));
        }
        const cmd = candidates[index++];
        exec(cmd, { env }, (err) => {
          if (err) {
            tryNext(err);
          } else {
            resolve(true);
          }
        });
      };
      tryNext();
    });
  });

  ipcMain.handle('projects:get-branches', async (_, projectPath) => {
    return await getProjectBranches(projectPath);
  });

  ipcMain.handle('projects:checkout', async (_, { projectPath, branch }) => {
    return await checkoutBranch(projectPath, branch);
  });

  ipcMain.handle('projects:set-remote-url', async (_, { projectPath, remoteName, newUrl }) => {
    return await setRemoteUrl(projectPath, remoteName, newUrl);
  });

  ipcMain.handle('projects:reset-changes', async (_, { projectPath, options }) => {
    return await resetProjectChanges(projectPath, options);
  });

  ipcMain.handle('notifications:show', async (_, { title, body, sound = true }: { title: string; body: string; sound?: boolean }) => {
    let delivered = false;
    const notifTitle = title || 'Gity';
    const notifBody = body || '';

    if (process.platform === 'darwin') {
      try {
        if (app.dock) {
          app.dock.bounce('informational');
        }
        if (sound) {
          exec('afplay /System/Library/Sounds/Ping.aiff', () => {});
        }

        const notifierBinary = app.isPackaged
          ? path.join(process.resourcesPath, 'GityNotifier.app/Contents/MacOS/terminal-notifier')
          : path.join(app.getAppPath(), 'build/GityNotifier.app/Contents/MacOS/terminal-notifier');

        if (fs.existsSync(notifierBinary)) {
          const args = [
            '-title', notifTitle,
            '-message', notifBody,
            '-timeout', '5',
          ];
          if (sound) {
            args.push('-sound', 'default');
          }

          execFile(notifierBinary, args, (err) => {
            if (err) {
              console.warn('[Notifications] GityNotifier fallback to osascript:', err);
              const cleanTitle = notifTitle.replace(/["\\]/g, '\\$&');
              const cleanBody = notifBody.replace(/["\\]/g, '\\$&');
              const soundParam = sound ? ' sound name "Ping"' : '';
              exec(`osascript -e 'display notification "${cleanBody}" with title "${cleanTitle}"${soundParam}'`);
            }
          });
          delivered = true;
        } else if (Notification.isSupported()) {
          const iconPath = app.isPackaged
            ? path.join(process.resourcesPath, 'icon.png')
            : path.join(app.getAppPath(), 'build/icon.png');
          const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;
          const notification = new Notification({
            title: notifTitle,
            body: notifBody,
            icon,
            silent: true,
          });

          notification.on('click', () => {
            if (mainWindow) {
              if (mainWindow.isMinimized()) mainWindow.restore();
              mainWindow.focus();
            }
          });

          notification.show();
          delivered = true;
        } else {
          const cleanTitle = notifTitle.replace(/["\\]/g, '\\$&');
          const cleanBody = notifBody.replace(/["\\]/g, '\\$&');
          const soundParam = sound ? ' sound name "Ping"' : '';
          exec(`osascript -e 'display notification "${cleanBody}" with title "${cleanTitle}"${soundParam}'`);
          delivered = true;
        }
      } catch (e) {
        console.warn('[Notifications] macOS dispatch error:', e);
      }
    } else {
      // Windows / Linux native notifications
      try {
        if (Notification.isSupported()) {
          const iconCandidates = [
            path.join(process.resourcesPath, 'icon.png'),
            path.join(app.getAppPath(), 'build/icon.png'),
            path.join(app.getAppPath(), 'build/icon.ico'),
          ];
          const iconPath = iconCandidates.find(p => fs.existsSync(p));
          const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined;
          const notification = new Notification({
            title: notifTitle,
            body: notifBody,
            icon,
            silent: !sound,
          });

          notification.on('click', () => {
            if (mainWindow) {
              if (mainWindow.isMinimized()) mainWindow.restore();
              mainWindow.focus();
            }
          });

          notification.show();
          delivered = true;
        }
      } catch (err) {
        console.warn('[Notifications] Native Notification error:', err);
      }
    }

    return delivered;
  });
}

app.setName('Gity');
if (process.platform === 'win32') {
  app.setAppUserModelId('com.gity.app');
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
