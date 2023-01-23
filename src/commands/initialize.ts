import * as vscode from 'vscode';
import fs from 'fs/promises';
import fsx from 'fs-extra';
import path from 'path';
import { initFolderConfig } from '../config';

export async function initialize() {
  if ((vscode.workspace.workspaceFolders?.length || 0) > 0) {
    const vscodePath = path.join(
      vscode.workspace.workspaceFolders![0].uri.fsPath,
      '.vscode'
    );
    await fsx.ensureDir(vscodePath);
    const configFilePath = path.join(vscodePath, 'ios-remote-build.json');
    if (!(await fsx.exists(configFilePath))) {
      await fs.writeFile(
        configFilePath,
        JSON.stringify({ provisioningProfile: '', exportOptionsPlist: '', devTeamId: '', })
      );
    }
    initFolderConfig();
  } else {
    vscode.window.showErrorMessage(
      'No folder active, please open a Folder/Workspace to use iOS Remote Build'
    );
  }
}
