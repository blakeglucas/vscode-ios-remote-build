import { getLogger } from '../logger';
import { getFolderConfig, updateFolderConfig } from '../config';
import { showQuickFilePick } from '../utils/QuickFilePick';

export async function selectExportPlist() {
  const logger = getLogger();
  const exportOptionsPlist = getFolderConfig('exportOptionsPlist');
  const newEOP = await showQuickFilePick();
  if (newEOP) {
    logger.info('New exportOptionsPlist ' + newEOP);
    updateFolderConfig('exportOptionsPlist', newEOP);
  }

  return newEOP;
}
