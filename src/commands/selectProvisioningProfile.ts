import { getLogger } from '../logger';
import { getFolderConfig, updateFolderConfig } from '../config';
import { showQuickFilePick } from '../utils/QuickFilePick';

export async function selectProvisioningProfile() {
  const logger = getLogger();
  const provProfile = getFolderConfig('provisioningProfile');
  const newProfile = await showQuickFilePick();
  if (newProfile) {
    logger.info('New provisioningProfile ' + newProfile);
    updateFolderConfig('provisioningProfile', newProfile);
  }

  return newProfile;
}
