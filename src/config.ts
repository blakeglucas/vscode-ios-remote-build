import { ConfigurationTarget, workspace } from 'vscode';

export function updateConfig(section: string, value: any) {
  return workspace.getConfiguration('ios-remote-build').update(section, value, ConfigurationTarget.Global);
}

export function getConfig<T = any>(key: string) {
    return workspace.getConfiguration('ios-remote-build').get(key) as T;
}