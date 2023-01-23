import { PathLike } from 'fs';
import fs from 'fs/promises';

export class JSONStore {
  private fileContent: any;
  private readonly filePath;
  constructor(fp: string | PathLike) {
    this.filePath = fp;
    this.readFile();
  }

  async readFile() {
    this.fileContent = JSON.parse(
      (await fs.readFile(this.filePath)).toString()
    );
  }

  get(key: string) {
    return this.fileContent[key];
  }

  async set(key: string, value: any) {
    this.fileContent = {
      ...this.fileContent,
      [key]: value,
    };
    this.write();
  }

  private async write() {
    await fs.writeFile(this.filePath, JSON.stringify(this.fileContent));
  }
}
