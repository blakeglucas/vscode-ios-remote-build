import { Socket, connect } from 'socket.io-client';
import { logger } from './logger';

let conn: Socket | undefined;

export async function connectSocket(host: string, port: number) {
  logger.log(`${host}:${port}`);
  conn = connect(`${host}:${port}`, { reconnection: false });
  return await new Promise((resolve) => {
    conn!.once('connect', () => {
      resolve(true);
    });
    conn!.once('connect_failed', (...args: any[]) => {
      logger.info('connect_failed');
      resolve(false);
    });
    conn!.once('error', (...args: any[]) => {
      logger.info('error');
      resolve(false);
    });
    conn!.once('disconnect', (...args: any[]) => {
      logger.info('disconnect');
      resolve(false);
    });
  });
}

export function disconnectSocket() {
  if (conn && conn.connected) {
    conn.disconnect(); // TODO: set to undefined?
  }
}

export function getConnectionStatus() {
  return conn && conn.connected; // TODO: more?
}

export function sendStartBuffer(buf: Buffer) {
  if (getConnectionStatus()) {
    conn!.emit('build/start', buf);
  }
}
