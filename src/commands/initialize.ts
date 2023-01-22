import * as vscode from 'vscode';
import fs from 'fs/promises';
import fsx from 'fs-extra';
import path from 'path';

export async function initialize() {
  if ((vscode.workspace.workspaceFolders?.length || 0) > 0) {
    const vscodePath = path.join(
      vscode.workspace.workspaceFolders![0].uri.fsPath,
      '.vscode'
    );
    await fsx.ensureDir(vscodePath);
    await fs.writeFile(
      path.join(vscodePath, '.ios-remote-build'),
      '// This file just tells VSCode to activate the iOS Remote Build Extension'
    );
  } else {
    vscode.window.showErrorMessage(
      'No folder active, please open a Folder/Workspace to use iOS Remote Build'
    );
  }
}
