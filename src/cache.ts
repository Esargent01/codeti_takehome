import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export class HtmlCache {
  constructor(private readonly directory: string) {}

  private pathFor(url: string): string {
    const hash = createHash('sha256').update(url).digest('hex');
    return join(this.directory, `${hash}.html`);
  }

  async get(url: string): Promise<string | undefined> {
    try {
      return await readFile(this.pathFor(url), 'utf8');
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
  }

  async set(url: string, html: string): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.pathFor(url), html, 'utf8');
  }
}
