import { window } from 'vscode';
import { getLogger } from '../logger';
import { getFolderConfig, updateFolderConfig } from '../config';

export async function setDevTeamId() {
  const logger = getLogger();
  const currentTeamId = getFolderConfig('devTeamId');
  const teamIdInput = await window.showInputBox({
    title: 'Apple Development Team ID',
    value: currentTeamId as string,
  });
  logger.info('New dev team id ' + teamIdInput);
  if (teamIdInput) {
    updateFolderConfig('devTeamId', teamIdInput);
  }
  return teamIdInput || currentTeamId;
}
