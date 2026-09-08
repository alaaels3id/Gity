import { contextBridge, ipcRenderer } from 'electron';
import { GityAPI } from './types';

const api: GityAPI = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectFolder: (currentPath) => ipcRenderer.invoke('dialog:select-folder', currentPath),
  scanProjects: (folderPath) => ipcRenderer.invoke('projects:scan', folderPath),
  openLocation: (projectPath) => ipcRenderer.invoke('projects:open-location', projectPath),
  fetchRemote: (projectPath) => ipcRenderer.invoke('projects:fetch', projectPath),
  pullProject: (projectPath) => ipcRenderer.invoke('projects:pull', projectPath),
  pushProject: (projectPath: string, options?: { force?: boolean }) => ipcRenderer.invoke('projects:push', { projectPath, force: options?.force }),
  commitAndPush: (projectPath: string, message: string, files?: string[]) => ipcRenderer.invoke('projects:commit-and-push', { projectPath, message, files }),
  getStatus: (projectPath) => ipcRenderer.invoke('projects:status', projectPath),
  getGitStatus: (projectPath) => ipcRenderer.invoke('projects:status', projectPath),
  getProjectDetails: (projectPath) => ipcRenderer.invoke('projects:details', projectPath),
  getFileDiff: (projectPath, filePath) => ipcRenderer.invoke('projects:file-diff', { projectPath, filePath }),
  openEditor: (projectPath: string, editor?: string) => ipcRenderer.invoke('projects:open-editor', { projectPath, editor }),
  openInEditor: (projectPath: string, editor?: string) => ipcRenderer.invoke('projects:open-editor', { projectPath, editor }),
  getBranches: (projectPath) => ipcRenderer.invoke('projects:get-branches', projectPath),
  checkoutBranch: (projectPath, branch) => ipcRenderer.invoke('projects:checkout', { projectPath, branch }),
  setRemoteUrl: (projectPath, remoteName, newUrl) => ipcRenderer.invoke('projects:set-remote-url', { projectPath, remoteName, newUrl }),
  resetChanges: (projectPath: string, options) => ipcRenderer.invoke('projects:reset-changes', { projectPath, options }),
  showNotification: (title, body, sound = true) => ipcRenderer.invoke('notifications:show', { title, body, sound }),
};

contextBridge.exposeInMainWorld('gityAPI', api);
contextBridge.exposeInMainWorld('api', api);
