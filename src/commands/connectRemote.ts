import * as vscode from 'vscode';
import * as socketHandler from '../socketHandler';
import { getConfig } from '../config';
import { editRemoteHost } from '../commands/editRemoteHost';
import { logger } from '../logger';

export async function connectRemote() {
  let host: string | undefined = getConfig('remoteHost');
  while (!host) {
    host = await editRemoteHost();
  }
  logger.info('Attempting connection to ' + host + ' on port ' + 6969);
  let result = await socketHandler.connectSocket(host, 6969);
  if (result) {
    vscode.window.showInformationMessage(`Connection Successful`);
  } else {
    vscode.window.showErrorMessage(
      `Connection to "${host}" failed. Ensure the iOS Remote Build Server application is running on the target machine and that the selected port is open.`
    );
  }
}
