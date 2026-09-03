import { contextBridge, ipcRenderer } from 'electron';
import { GityAPI } from './types';

const api: GityAPI = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectFolder: (currentPath) => ipcRenderer.invoke('dialog:select-folder', currentPath),
  scanProjects: (folderPath) => ipcRenderer.invoke('projects:scan', folderPath),
  openLocation: (projectPath) => ipcRenderer.invoke('projects:open-location', projectPath),
  fetchRemote: (projectPath) => ipcRenderer.invoke('projects:fetch', projectPath),
  getStatus: (projectPath) => ipcRenderer.invoke('projects:status', projectPath),
  getProjectDetails: (projectPath) => ipcRenderer.invoke('projects:details', projectPath),
  getFileDiff: (projectPath, filePath) => ipcRenderer.invoke('projects:file-diff', { projectPath, filePath }),
  openEditor: (projectPath, editor) => ipcRenderer.invoke('projects:open-editor', { projectPath, editor }),
};

contextBridge.exposeInMainWorld('gityAPI', api);
contextBridge.exposeInMainWorld('api', api);
