import { window } from 'vscode';
import { getLogger } from '../logger';
import { getGlobalConfig, updateGlobalConfig } from '../config';

export async function editRemoteHost() {
  const logger = getLogger();
  const currentHost = getGlobalConfig('remoteHost');
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
    updateGlobalConfig('remoteHost', hostInput);
  }
  return hostInput || currentHost;
}
