import { PathLike } from 'fs';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

type ProcessRunnerOptions = Partial<{
  onStdOut: (msg: string) => unknown | Promise<unknown>;
  onStdErr: (msg: string) => unknown | Promise<unknown>;
  onError: (err: Error) => unknown | Promise<unknown>;
  onClose: (code: number | null) => void | Promise<void>;
  spawnOptions: SpawnOptionsWithoutStdio;
}>;

export async function commandRunner(
  cmd: string | string[],
  cwd: string | PathLike,
  options?: ProcessRunnerOptions
) {
  const cmdStr = Array.isArray(cmd) ? cmd.join(' ') : cmd;
  return await new Promise<number | null>((resolve, reject) => {
    const proc = spawn(cmdStr, {
      shell: true,
      cwd: cwd.toString(),
      ...(options?.spawnOptions || {}),
    });
    proc.stdout.on('data', (msg: Buffer) => {
      if (options?.onStdOut) {
        options.onStdOut(msg.toString().trim());
      }
    });
    proc.stderr.on('data', (msg: Buffer) => {
      if (options?.onStdErr) {
        options.onStdErr(msg.toString().trim());
      }
    });
    proc.on('error', (err) => {
      if (options?.onError) {
        options.onError(err)
      }
      reject(err)
    })
    proc.on('close', (code) => {
      if (options?.onClose) {
        options.onClose(code)
      }
      resolve(code)
    })
  });
}
