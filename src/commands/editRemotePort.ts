import { window } from 'vscode';
import { getLogger } from '../logger';
import { getGlobalConfig, updateGlobalConfig } from '../config';

export async function editRemotePort() {
  const logger = getLogger()
  const port = getGlobalConfig('remotePort');
  const portInput = await window.showInputBox({
    title: 'iOS Remote Build Port',
    value: port as string,
    validateInput: (value) => {
      return isNaN(Number(value)) || Number(value) < 1
        ? 'Invalid port number'
        : null;
    },
  });
  logger.info('New port input: ' + portInput);
  updateGlobalConfig('remotePort', Number(portInput));
  return Number(portInput);
}
