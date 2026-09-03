import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { loadSettings, saveSettings } from './settingsStore';
import { scanDirectory, scanMultipleDirectories, getProjectFullDetails } from './projectScanner';
import { fetchRemote, getDetailedStatus, getFileDiff } from './gitService';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 850,
    minHeight: 550,
    title: 'Gity - Laravel & Git Workspace',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
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

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Projects Directory',
      defaultPath: currentPath || '/Users/alaaelsaid/code',
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('projects:scan', async (_, folderPaths) => {
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
      pathsToScan = ['/Users/alaaelsaid/code'];
    }

    return await scanMultipleDirectories(pathsToScan);
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
    return new Promise((resolve, reject) => {
      exec(`${editor} "${projectPath}"`, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  });
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
