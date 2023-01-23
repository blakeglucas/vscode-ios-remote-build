import { ConfigurationTarget, workspace } from 'vscode';
import path from 'path';
import { JSONStore } from './utils/JSONStore';

let folderConfig: JSONStore | undefined;

export function initFolderConfig() {
  const configFilePath = path.join(
    (workspace.workspaceFolders || [])[0].uri.fsPath,
    '.vscode',
    'ios-remote-build.json'
  );

  folderConfig = new JSONStore(configFilePath);
}

export function updateGlobalConfig(section: string, value: any) {
  return workspace
    .getConfiguration('ios-remote-build')
    .update(section, value, ConfigurationTarget.Global);
}

export async function updateFolderConfig(section: string, value: any) {
  await folderConfig!.set(section, value);
  return getFolderConfig(section);
}

export function getGlobalConfig<T = any>(key: string) {
  return workspace.getConfiguration('ios-remote-build').get(key) as T;
}

export function getFolderConfig<T = any>(key: string) {
  return folderConfig!.get(key) as T;
}
