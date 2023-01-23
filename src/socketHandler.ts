import { Socket, connect } from 'socket.io-client';
import fxs from 'fs-extra';
import * as vscode from 'vscode';
import path from 'path';
import tar from 'tar-fs';
import { getLogger } from './logger';
import { showConnected, showDisconnected } from './statusItemHandler';
import { Readable } from 'stream';

const logger = getLogger();
let conn: Socket | undefined;

export async function connectSocket(host: string, port: number) {
  const logger = getLogger();
  conn = connect(`${host}:${port}`);
  const result = await new Promise((resolve) => {
    conn!.once('connect', () => {
      resolve(true);
    });
    conn!.once('connect_failed', (...args: any[]) => {
      logger.debug('connect_failed', ...args);
      resolve(false);
    });
  });
  if (result) {
    showConnected();
    conn.on('disconnect', onDisconnect);
    conn.on('log/stdout', onStdOut);
    conn.on('log/stderr', onStdErr);
    conn.on('log/msg', onStdOut);
    conn.on('log/error', onStdErr);
    conn.on('build/finish', onBuildFinish);
  } else {
    showDisconnected();
  }
  return result;
}

export function disconnectSocket() {
  if (conn && conn.connected) {
    conn.disconnect(); // TODO: set to undefined?
  }
}

export function getConnectionStatus() {
  return conn && conn.connected; // TODO: more?
}

export function startBuild(
  files: Buffer,
  devTeamId: string,
  eop?: Buffer,
  provProfile?: Buffer,
  provProfileSpecifier?: string
) {
  const logger = getLogger();
  if (getConnectionStatus()) {
    logger.info('Starting build...');
    conn!.emit(
      'build/start',
      files,
      devTeamId,
      eop,
      provProfile,
      provProfileSpecifier
    );
  }
}

function onDisconnect() {
  showDisconnected();
  logger.info('Remote host disconnected');
  if (conn) {
    conn.off('log/stdout', onStdOut);
    conn.off('log/stderr', onStdErr);
    conn.off('log/msg', onStdOut);
    conn.off('log/error', onStdErr);
    conn.off('build/finish', onBuildFinish);
  }
}

function onStdOut(msg: string) {
  getLogger().info(msg);
}

function onStdErr(msg: string) {
  getLogger().warn(msg);
}

async function onBuildFinish(retCode: number, iosTar?: Buffer) {
  getLogger().info('onBuildFinish');
  if (retCode === 0) {
    const outPath = path.join(
      vscode.workspace.workspaceFolders![0].uri.fsPath,
      'ios'
    );
    new Readable({
      read() {
        this.push(iosTar!);
        this.push(null);
      },
    }).pipe(tar.extract(outPath, { readable: true, writable: true }));
  } else {
    vscode.window.showErrorMessage(
      'iOS Remote Build failed with code ' + retCode
    );
  }
}
