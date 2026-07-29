import { HtmlCache } from './cache.js';

const CRAWL_DELAY_MS = 3_000;

export class PoliteClient {
  private nextRequestAt = 0;

  constructor(
    private readonly cache: HtmlCache,
    private readonly refresh = false,
  ) {}

  async getHtml(url: string): Promise<string> {
    if (!this.refresh) {
      const cached = await this.cache.get(url);
      if (cached !== undefined) return cached;
    }

    const waitMs = Math.max(0, this.nextRequestAt - Date.now());
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));

    this.nextRequestAt = Date.now() + CRAWL_DELAY_MS;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'codeti-take-home-aggregator/0.1 (educational; cached)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);

    const html = await response.text();
    await this.cache.set(url, html);
    return html;
  }
}
