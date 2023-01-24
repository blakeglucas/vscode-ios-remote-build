import * as vscode from 'vscode';
import { buildHandler } from '../socket';

export async function runRemoteBuild() {
  const builds = await buildHandler!.listBuilds();
  const selectedBuild = await vscode.window.showQuickPick(builds, {
    title: 'Select Remote Build to Run',
  });
  if (selectedBuild) {
    buildHandler!.runBuild(selectedBuild);
  }
}
