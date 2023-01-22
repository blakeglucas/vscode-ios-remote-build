import * as vscode from 'vscode';
import { logger } from './logger';
import * as socketHandler from './socketHandler';

import { editRemotePort } from './commands/editRemotePort';
import { editRemoteHost } from './commands/editRemoteHost';
import { connectRemote } from './commands/connectRemote';
import { showCommands } from './commands/showCommands';
import { startBuild } from './commands/startBuild';
import { disconnectRemote } from './commands/disconnectRemote';
import { initialize } from './commands/initialize';

export function activate(context: vscode.ExtensionContext) {
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
    vscode.commands.registerCommand('ios-remote-build.startBuild', startBuild)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ios-remote-build.showCommands',
      showCommands
    )
  );

  // Initialize Status Bar
  const statusBarItem = vscode.window.createStatusBarItem(1);
  statusBarItem.text = 'iOS Remote';
  statusBarItem.command = 'ios-remote-build.showCommands';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {
  logger.dispose();
  socketHandler.disconnectSocket();
}
