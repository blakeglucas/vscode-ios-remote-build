import * as vscode from 'vscode';
import * as socketHandler from '../socket';

export async function disconnectRemote() {
  if (socketHandler.getConnectionStatus()) {
    socketHandler.disconnectSocket();
    vscode.window.showInformationMessage('Disconnected successfully');
  } else {
    vscode.window.showInformationMessage('Socket not connected');
  }
}
