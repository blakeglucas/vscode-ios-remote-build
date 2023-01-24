import { workspaceHandler } from '../socket';

export async function detachWorkspace() {
  workspaceHandler!.deactivateWorkspace();
}
