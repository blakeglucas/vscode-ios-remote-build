import { Socket } from 'socket.io-client';
import { getLogger } from '../logger';
import * as vscode from 'vscode';

export class SocketLogHandler implements vscode.Disposable {
  private readonly logger;
  constructor(private readonly socket: Socket) {
    this.onStdOut = this.onStdOut.bind(this);
    this.onStdErr = this.onStdErr.bind(this);
    socket.on('log/stdout', this.onStdOut);
    socket.on('log/stderr', this.onStdErr);
    socket.on('log/msg', this.onStdOut);
    socket.on('log/error', this.onStdErr);
    this.logger = getLogger();
  }

  onStdOut(msg: string) {
    this.logger.info(msg);
  }

  onStdErr(msg: string) {
    this.logger.warn(msg);
  }

  dispose() {
    this.socket.off('log/stdout', this.onStdOut);
    this.socket.off('log/stderr', this.onStdErr);
    this.socket.off('log/msg', this.onStdOut);
    this.socket.off('log/error', this.onStdErr);
  }
}
