import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

const baseText = 'iOS Remote';

export function initStatusItem(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(1);
  showDisconnected();
  statusBarItem.command = 'ios-remote-build.showCommands';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function showDisconnected() {
  if (statusBarItem) {
    statusBarItem.text = `$(debug-disconnect) ${baseText}`;
  }
}

export function showConnecting() {
  if (statusBarItem) {
    statusBarItem.text = `$(loading~spin) ${baseText}`;
  }
}

export function showConnected() {
  if (statusBarItem) {
    statusBarItem.text = `$(check) ${baseText}`;
  }
}

export function showWorkspaceConnected(name: string) {
  if (statusBarItem) {
    statusBarItem.text += ` : ${name}`;
  }
}

export function showNormalStatusItem() {
  if (statusBarItem) {
    statusBarItem.text = statusBarItem.text.split(' : ')[0];
  }
}
