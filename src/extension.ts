import * as vscode from 'vscode';
import { getLogger, initLogger } from './logger';
import * as socketHandler from './socketHandler';

import { editRemotePort } from './commands/editRemotePort';
import { editRemoteHost } from './commands/editRemoteHost';
import { connectRemote } from './commands/connectRemote';
import { showCommands } from './commands/showCommands';
import { startBuild } from './commands/startBuild';
import { disconnectRemote } from './commands/disconnectRemote';
import { initialize } from './commands/initialize';
import { selectExportPlist } from './commands/selectExportPlist';
import { selectProvisioningProfile } from './commands/selectProvisioningProfile';
import { initFolderConfig } from './config';
import { initStatusItem } from './statusItemHandler';
import { setDevTeamId } from './commands/setDevTeamId';
import { installIPA } from './commands/installIPA';

export function activate(context: vscode.ExtensionContext) {
  initLogger(context);
  initFolderConfig();
  initStatusItem(context);
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ios-remote-build.initialize', initialize),
    vscode.commands.registerCommand(
      'ios-remote-build.editRemoteHost',
      editRemoteHost
    ),
    vscode.commands.registerCommand(
      'ios-remote-build.editRemotePort',
      editRemotePort
    ),
    vscode.commands.registerCommand(
      'ios-remote-build.connectRemote',
      connectRemote
    ),
    vscode.commands.registerCommand(
      'ios-remote-build.disconnectRemote',
      disconnectRemote
    ),
    vscode.commands.registerCommand('ios-remote-build.startBuild', startBuild),
    vscode.commands.registerCommand(
      'ios-remote-build.setDevTeamId',
      setDevTeamId
    ),
    vscode.commands.registerCommand(
      'ios-remote-build.selectProvisioningProfile',
      selectProvisioningProfile
    ),
    vscode.commands.registerCommand(
      'ios-remote-build.selectExportPlist',
      selectExportPlist
    ),
    vscode.commands.registerCommand('ios-remote-build.installIPA', installIPA)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ios-remote-build.showCommands',
      showCommands
    )
  );

  // Initialize Status Bar
}

export function deactivate() {
  socketHandler.disconnectSocket();
}
