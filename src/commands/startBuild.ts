import * as vscode from 'vscode';
import * as socketHandler from '../socket';
import { getFolderConfig, getGlobalConfig } from '../config';
import { getLogger } from '../logger';
import * as fs from 'fs/promises';
import fsx from 'fs-extra';
import * as path from 'path';
//@ts-ignore
import ignoreParser from '@gerhobbelt/gitignore-parser';
import { pack } from 'tar-fs';
import { Writable } from 'stream';

export async function startBuild() {
  const logger = getLogger();
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage('No active workspace folders, cannot build');
    return;
  }
  if (!socketHandler.getConnectionStatus()) {
    vscode.window.showErrorMessage('Not connected to the remote host.');
    return;
  }
  if (!getFolderConfig('devTeamId')) {
    vscode.window.showErrorMessage(
      'Apple Development Team ID not set, build will fail'
    );
    return;
  }
  const ignoreParsers: any[] = [ignoreParser.compile('.git')];
  const currentFolder = vscode.workspace.workspaceFolders[0];
  if (await fsx.exists(path.join(currentFolder.uri.fsPath, '.gitignore'))) {
    const ignoreContent = await fs.readFile(
      path.join(currentFolder.uri.fsPath, '.gitignore')
    );
    const gitignore = ignoreParser.compile(ignoreContent.toString());
    ignoreParsers.push(gitignore);
  }
  if (await fsx.exists(path.join(currentFolder.uri.fsPath, '.vscodeignore'))) {
    const ignoreContent = await fs.readFile(
      path.join(currentFolder.uri.fsPath, '.vscodeignore')
    );
    const vscodeignore = ignoreParser.compile(ignoreContent.toString());
    ignoreParsers.push(vscodeignore);
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
      if (
        ignoreParsers.map((parser) => parser.denies(relName)).filter((x) => x)
          .length > 0
      ) {
        return true;
      }
      return false;
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
    ppFileContent = await fs.readFile(ppp);
  }

  if (!getFolderConfig('exportOptionsPlist')) {
    logger.info(
      'Export Options Plist not set, will attempt to construct one from provisioning profile'
    );
  }

  const eopPath = getFolderConfig('exportOptionsPlist');
  let eopFileContent: Buffer | undefined;
  if (eopPath) {
    eopFileContent = await fs.readFile(eopPath);
  }

  const developmentTeamId = getFolderConfig('devTeamId');

  socketHandler.buildHandler!.startBuild({
    files: data,
    developmentTeamId,
    provisioningProfile: ppFileContent,
    exportOptionsPlist: eopFileContent,
  });
}
