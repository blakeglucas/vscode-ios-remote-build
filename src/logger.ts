/**
 * This file manages the logger's state.
 */
import { readFile as readFileCallback } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
import { ExtensionContext, window } from 'vscode';
import { IChildLogger, IVSCodeExtLogger } from '@vscode-logging/types';
import { configureLogger, NOOP_LOGGER } from '@vscode-logging/wrapper';

const readFile = promisify(readFileCallback);

// On file load we initialize our logger to `NOOP_LOGGER`
// this is done because the "real" logger cannot be initialized during file load.
// only once the `activate` function has been called in extension.ts
// as the `ExtensionContext` argument to `activate` contains the required `logPath`
let loggerImpel: IVSCodeExtLogger = NOOP_LOGGER;

export function getLogger(): IChildLogger {
  return loggerImpel;
}

function setLogger(newLogger: IVSCodeExtLogger): void {
  loggerImpel = newLogger;
}

const LOGGING_LEVEL_PROP = 'ios-remote-build.loggingLevel';
const SOURCE_LOCATION_PROP = 'ios-remote-build.sourceLocationTracking';

export async function initLogger(context: ExtensionContext): Promise<void> {
  const meta = JSON.parse(
    await readFile(resolve(__dirname, '..', 'package.json'), 'utf8')
  );

  const extLogger = configureLogger({
    extName: meta.displayName,
    logPath: context.logUri.fsPath,
    logOutputChannel: window.createOutputChannel(meta.displayName),
    logConsole: false,
    loggingLevelProp: LOGGING_LEVEL_PROP,
    sourceLocationProp: SOURCE_LOCATION_PROP,
    subscriptions: context.subscriptions,
  });

  setLogger(extLogger);
}
