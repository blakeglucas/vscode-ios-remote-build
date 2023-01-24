import { Socket, connect } from 'socket.io-client';
import { getLogger } from '../logger';
import {
  showConnected,
  showConnecting,
  showDisconnected,
} from '../handlers/statusItemHandler';
import { SocketBuildHandler } from '../socket/buildHandler';
import { SocketLogHandler } from '../socket/logHandler';
import { SocketWorkspaceHandler } from '../socket/workspaceHandler';

let conn: Socket | undefined;
export let buildHandler: SocketBuildHandler | undefined;
export let logHandler: SocketLogHandler | undefined;
export let workspaceHandler: SocketWorkspaceHandler | undefined;

export async function connectSocket(host: string, port: number) {
  const logger = getLogger();
  const result = await new Promise((resolve) => {
    showConnecting();
    conn = connect(`${host}:${port}`, {
      reconnectionDelay: 250,
      reconnectionAttempts: 10,
    });
    conn.once('connect', () => {
      resolve(true);
    });
    conn.once('connect_failed', (...args: any[]) => {
      logger.debug('connect_failed', ...args);
      resolve(false);
    });
  });
  if (result) {
    showConnected();
    buildHandler = new SocketBuildHandler(conn!);
    logHandler = new SocketLogHandler(conn!);
    workspaceHandler = new SocketWorkspaceHandler(conn!);
    conn!.on('disconnect', disposeHandlers);
    conn!.on('disconnect', showDisconnected);
  } else {
    showDisconnected();
  }
  return result;
}

export function disconnectSocket() {
  if (conn && conn.connected) {
    disposeHandlers();
    conn.disconnect(); // TODO: set to undefined?
  }
}

export function getConnectionStatus() {
  return conn && conn.connected; // TODO: more?
}

function disposeHandlers() {
  buildHandler?.dispose();
  logHandler?.dispose();
  workspaceHandler?.dispose();
  buildHandler = undefined;
  logHandler = undefined;
  workspaceHandler = undefined;
}
