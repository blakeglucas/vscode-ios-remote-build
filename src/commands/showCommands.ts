import { getLogger } from '../logger';
import * as vscode from 'vscode';
import path from 'path';

export async function showCommands() {
  const logger = getLogger();
  const meta = require(path.resolve(__dirname, '../..', 'package.json'));
  const selection = await vscode.window.showQuickPick(
    meta.contributes.commands.slice(0, -2).map((x: vscode.Command) => x.title)
  );
  if (selection) {
    const command = meta.contributes.commands.find(
      (x: vscode.Command) => x.title === selection
    );
    await vscode.commands.executeCommand(command!.command);
  } else {
    logger.info('no command selected');
  }
}
