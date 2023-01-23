import * as vscode from 'vscode';
import { commandRunner } from '../utils/CommandRunner';
import glob from 'glob';
import path from 'path';
import { getLogger } from '../logger';

export async function installIPA() {
  const logger = getLogger();
  const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const ipaFiles = await new Promise<string[]>((resolve, reject) => {
    const searchPattern = path
      .join(workspacePath, 'ios', '*.ipa')
      .split(path.sep)
      .join(path.posix.sep);
    glob(searchPattern, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    });
  });
  const selectedFile = await vscode.window.showQuickPick(
    ipaFiles.map((ipaFile) => path.relative(workspacePath, ipaFile)),
    {
      title: 'Select .ipa File',
    }
  );
  const UDIDs = await new Promise<string[]>((resolve) => {
    commandRunner('pyidevice devices', workspacePath, {
      onStdOut: (msg) => {
        const match = msg.match(/(?<=serial:)[\w\-]+(?=,)/g);
        resolve(match || []);
      },
    });
  });
  const prettyDevices = await Promise.all(
    UDIDs.map(async (udid) => {
      const deviceInfo: any = await new Promise<any>((resolve) => {
        commandRunner(
          `pyidevice deviceinfo --udid ${udid} --format json`,
          workspacePath,
          {
            onStdOut: (msg) => {
              resolve(JSON.parse(msg));
            },
          }
        );
      });
      return `${deviceInfo['DeviceName']} : ${udid}`;
    })
  );
  const selectedDevice = await vscode.window.showQuickPick(prettyDevices, {
    title: 'Select Target Device',
  });
  if (selectedDevice) {
    logger.info('selected device ' + selectedDevice);
    const [_, selectedUDID] = selectedDevice.split(' : ');
    const installRetCode = await commandRunner(
      `pyidevice apps install ${selectedFile} --udid ${selectedUDID}`,
      workspacePath
    );
    logger.info('Install finished with code: ' + installRetCode);
  }
}
