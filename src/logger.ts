import * as vscode from 'vscode';

export class Logger {
  private readonly logChannel: vscode.OutputChannel;

  constructor() {
    this.logChannel = vscode.window.createOutputChannel('iOS Remote Build');
    this.logChannel.show(true);
  }

  log(value: string) {
    this.logChannel.appendLine(value);
  }

  info(value: string) {
    this.log(`[INFO]\t\t${value}`);
  }

  dispose() {
    this.logChannel.dispose();
  }
}

export const logger = new Logger();
