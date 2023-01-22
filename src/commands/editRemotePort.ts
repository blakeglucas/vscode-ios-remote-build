import { window } from 'vscode';
import { logger } from '../logger';
import { getConfig, updateConfig } from '../config';

export async function editRemotePort() {
  const port = getConfig('remotePort');
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
  updateConfig('remotePort', Number(portInput));
  return Number(portInput);
}
