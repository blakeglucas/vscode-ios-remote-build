import * as vscode from 'vscode';
import { getLogger } from '../logger';
import { workspaceHandler } from '../socket';

export async function attachWorkspace() {
  const workspaces = await workspaceHandler!.listWorkspaces();
  const selectedWorkspace = await vscode.window.showQuickPick(workspaces, {
    title: 'Select Workspace',
  });
  if (selectedWorkspace) {
    workspaceHandler!.activateWorkspace(selectedWorkspace);
  }
}
