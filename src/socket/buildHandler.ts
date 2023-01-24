import { Socket } from 'socket.io-client';
import { getLogger } from '../logger';
import path from 'path';
import * as vscode from 'vscode';
import fsx from 'fs-extra';
import tar from 'tar-fs';
import { Readable } from 'stream';
import { BuildPayload } from '../types/BuildPayload';

export class SocketBuildHandler implements vscode.Disposable {
  private readonly logger;
  constructor(private readonly socket: Socket) {
    this.onBuildFinish = this.onBuildFinish.bind(this);
    this.listBuilds = this.listBuilds.bind(this);
    this.runBuild = this.runBuild.bind(this);
    this.stopRun = this.stopRun.bind(this);

    this.logger = getLogger();
    socket.on('build/finish', this.onBuildFinish);
  }

  startBuild({
    files,
    developmentTeamId,
    exportOptionsPlist,
    provisioningProfile,
    provisioningSpecifier,
    release,
  }: BuildPayload) {
    const logger = getLogger();
    logger.info('Starting build...');
    this.socket.emit('build/start', {
      files,
      developmentTeamId,
      exportOptionsPlist,
      provisioningProfile,
      provisioningSpecifier,
      release,
    });
  }

  async onBuildFinish(iosTar?: Buffer) {
    this.logger.info('onBuildFinish');
    if (iosTar) {
      const outPath = path.join(
        vscode.workspace.workspaceFolders![0].uri.fsPath,
        'ios'
      );
      await fsx.remove(outPath);
      new Readable({
        read() {
          this.push(iosTar!);
          this.push(null);
        },
      }).pipe(tar.extract(outPath, { readable: true, writable: true }));
    } else {
      vscode.window.showErrorMessage(
        'Build failed, check the output logs for more information'
      );
    }
  }

  async listBuilds() {
    return await new Promise<string[]>((resolve, reject) => {
      this.socket.once('builds/list', (builds) => resolve(builds));
      this.socket.emit('builds/list');
    });
  }

  runBuild(buildId: string) {
    this.socket.emit('build/run', buildId);
  }

  stopRun() {
    this.socket.emit('run/stop');
  }

  dispose() {
    // TODO cancel build
    this.stopRun();
    this.socket.off('build/finish', this.onBuildFinish);
  }
}
