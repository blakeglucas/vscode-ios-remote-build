import * as vscode from 'vscode';
import fs from 'fs/promises';
import fsx from 'fs-extra';
import path from 'path';

export async function showQuickFilePick() {
  const rootFolder = (vscode.workspace.workspaceFolders || [])[0];
  if (!rootFolder) {
    vscode.window.showErrorMessage('No workspace opened!');
    return;
  }
  let currentPath = rootFolder.uri.fsPath;
  while (true) {
    let dirContents = await fs.readdir(currentPath);
    const selection = await vscode.window.showQuickPick(['.', '..', ...dirContents]);
    if (!selection) {
      break;
    }
    const selectedPath = path.join(currentPath, selection);
    if ((await fs.lstat(selectedPath)).isFile()) {
      return selectedPath;
    } else {
      currentPath = selectedPath;
    }
  }
}
