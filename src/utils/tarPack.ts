import { Ignore } from 'ignore';
import { Writable } from 'stream';
import { pack } from 'tar-fs';
import path from 'path';

export async function tarPack(
  folder: string,
  ignoreRules?: Ignore
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const ws = new Writable({
    write: (chunk, encoding, next) => {
      chunks.push(Buffer.from(chunk));
      next();
    },
  });
  pack(folder, {
    ignore(name) {
      return (
        ignoreRules?.ignores(
          path.relative(folder, name.split(path.sep).join(path.posix.sep))
        ) || false
      );
    },
  }).pipe(ws);

  await new Promise<void>((resolve) => {
    ws.on('finish', () => resolve());
  });

  return Buffer.concat(chunks);
}
