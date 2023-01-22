import { window } from 'vscode';
import { logger } from '../logger';
import { getConfig, updateConfig } from '../config';

export async function editRemoteHost() {
  const currentHost = getConfig('remoteHost');
  const hostInput = await window.showInputBox({
    title: 'iOS Remote Build Host',
    value: currentHost as string,
    validateInput: (value) => {
      try {
        new URL(value);
        return null;
      } catch {
        return 'Not a valid URL';
      }
    },
  });
  logger.info('New host input: ' + hostInput);
  if (hostInput) {
    updateConfig('remoteHost', hostInput);
  }
  return hostInput || currentHost;
}
