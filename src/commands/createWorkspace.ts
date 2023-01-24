import ignore from 'ignore';
import * as vscode from 'vscode';
import fsx from 'fs-extra';
import path from 'path';
import { Writable } from 'stream';
import { pack } from 'tar-fs';
import { getFolderConfig } from '../config';
import { getLogger } from '../logger';
import { buildHandler, workspaceHandler } from '../socket';

export async function createWorkspace(fromScratch?: boolean) {
  const logger = getLogger();
  const name = await vscode.window.showInputBox({
    title: 'New Workspace Name',
  });
  if (!name) {
    return;
  }
  const currentFolder = vscode.workspace.workspaceFolders![0];
  let success = false;
  if (fromScratch) {
    const ignores = ignore();
    if (await fsx.exists(path.join(currentFolder.uri.fsPath, '.gitignore'))) {
      const ignoreContent = await fsx.readFile(
        path.join(currentFolder.uri.fsPath, '.gitignore')
      );
      ignores.add(ignoreContent.toString());
    }
    if (
      await fsx.exists(path.join(currentFolder.uri.fsPath, '.vscodeignore'))
    ) {
      const ignoreContent = await fsx.readFile(
        path.join(currentFolder.uri.fsPath, '.vscodeignore')
      );
      ignores.add(ignoreContent.toString());
    }
    const chunks: Buffer[] = [];
    const ws = new Writable({
      write: (chunk, encoding, next) => {
        chunks.push(Buffer.from(chunk));
        next();
      },
    });
    pack(currentFolder.uri.fsPath, {
      ignore(name) {
        const relName = path
          .relative(currentFolder.uri.fsPath, name)
          .split(path.sep)
          .join(path.posix.sep);
        return ignores.ignores(relName);
      },
    }).pipe(ws);

    await new Promise<void>((resolve) => {
      ws.on('finish', () => resolve());
    });

    const data = Buffer.concat(chunks);

    const ppp = getFolderConfig('provisioningProfile');
    let ppFileContent: Buffer | undefined = undefined;
    if (!ppp) {
      vscode.window.showWarningMessage(
        'No provisioning profile selected, this may affect build success'
      );
    } else {
      ppFileContent = await fsx.readFile(ppp);
    }

    if (!getFolderConfig('exportOptionsPlist')) {
      logger.info(
        'Export Options Plist not set, will attempt to construct one from provisioning profile'
      );
    }

    const eopPath = getFolderConfig('exportOptionsPlist');
    let eopFileContent: Buffer | undefined;
    if (eopPath) {
      eopFileContent = await fsx.readFile(eopPath);
    }

    const developmentTeamId = getFolderConfig('devTeamId');
    success = await workspaceHandler!.createWorkspace(name, undefined, {
      files: data,
      developmentTeamId,
      provisioningProfile: ppFileContent,
      exportOptionsPlist: eopFileContent,
    });
  } else {
    const builds = await buildHandler!.listBuilds();
    const selectedBuild = await vscode.window.showQuickPick(builds);
    if (selectedBuild) {
      success = await workspaceHandler!.createWorkspace(name, selectedBuild);
    }
  }
  if (success) {
    const doActivation = await vscode.window.showInformationMessage(
      `Activate "${name}" Workspace?`,
      'Yes',
      'No'
    );
    if (doActivation === 'Yes') {
      workspaceHandler!.activateWorkspace(name);
    }
  } else {
    vscode.window.showErrorMessage(
      'Workspace creation failed, check the extension logs for more information'
    );
  }
}
