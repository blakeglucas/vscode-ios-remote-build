import { Socket } from 'socket.io-client';
import * as vscode from 'vscode';
import { BuildPayload } from '../types/BuildPayload';
import ignore from 'ignore';
import path from 'path';
import fsx from 'fs-extra';
import { tarPack } from '../utils/tarPack';
import {
  showNormalStatusItem,
  showWorkspaceConnected,
} from '../handlers/statusItemHandler';

export class SocketWorkspaceHandler implements vscode.Disposable {
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private currentFolder: string | undefined;

  constructor(private readonly socket: Socket) {
    this.onCreate = this.onCreate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  createWorkspace(
    name: string,
    fromBuildId?: string,
    buildPayload?: BuildPayload
  ) {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.once('workspace/create/finish', () => resolve(true));
      this.socket.once('workspace/create/error', () => resolve(false));
      this.socket.emit('workspace/create', name, fromBuildId, buildPayload);
    });
  }

  async activateWorkspace(name: string) {
    this.currentFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;
    this.socket.emit('workspace/activate', name);
    await this.syncFiles();
    this.createFileWatcher();
    showWorkspaceConnected(name);
  }

  async syncFiles() {
    const workspacesIgnores = ignore()
      .add('Pods/')
      .add('node_modules/')
      .add('.git/')
      .add('.vscode/')
      .add('.expo/')
      .add('android/')
      .add('ios/');
    const sourceContent = await tarPack(this.currentFolder!, workspacesIgnores);
    this.socket.emit('workspace/syncFiles', sourceContent);
  }

  async onCreate(uri: vscode.Uri) {
    const fp = uri.fsPath;
    const relPath = path
      .relative(this.currentFolder!, fp)
      .split(path.sep)
      .join(path.posix.sep);
    const content = await fsx.readFile(fp);
    this.socket.emit('workspace/file/create', relPath, content);
  }

  async onChange(uri: vscode.Uri) {
    const fp = uri.fsPath;
    const relPath = path
      .relative(this.currentFolder!, fp)
      .split(path.sep)
      .join(path.posix.sep);
    const content = await fsx.readFile(fp);
    this.socket.emit('workspace/file/change', relPath, content);
  }

  onDelete(uri: vscode.Uri) {
    const fp = uri.fsPath;
    const relPath = path
      .relative(this.currentFolder!, fp)
      .split(path.sep)
      .join(path.posix.sep);
    this.socket.emit('workspace/file/delete', relPath);
  }

  async listWorkspaces() {
    return await new Promise<string[]>((resolve, reject) => {
      this.socket.once('workspace/list', (workspaces) => resolve(workspaces));
      this.socket.emit('workspace/list');
    });
  }

  deactivateWorkspace() {
    this.socket.emit('workspace/deactivate');
    this.fileWatcher?.dispose();
    this.fileWatcher = undefined;
    showNormalStatusItem();
  }

  dispose() {
    this.fileWatcher?.dispose();
  }

  private createFileWatcher() {
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], '**/*')
    );
    this.fileWatcher.onDidCreate(this.onCreate);
    this.fileWatcher.onDidChange(this.onChange);
    this.fileWatcher.onDidDelete(this.onDelete);
  }
}
