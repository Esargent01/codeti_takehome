import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { aggregateFaqs } from './aggregate.js';
import { HtmlCache } from './cache.js';
import { PoliteClient } from './http.js';
import { hasExactlyThreeAs } from './normalize.js';
import { parseDirectory, parseFaqQuestions } from './parser.js';

const BASE_URL = 'https://www.baseball-reference.com';
const root = process.cwd();
const refresh = process.argv.includes('--refresh');
const client = new PoliteClient(new HtmlCache(join(root, 'data', 'cache')), refresh);

async function main(): Promise<void> {
  const directoryUrls = 'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => `${BASE_URL}/players/${letter}/`);
  // Do not parallelize requests: the client deliberately maintains a site-wide crawl delay.
  const players = [];
  for (const url of directoryUrls) players.push(...parseDirectory(await client.getHtml(url)));
  const matches = players.filter(hasExactlyThreeAs);
  console.log(`Found ${matches.length} matching players out of ${players.length} directory entries.`);

  const entries = [];
  for (const player of matches) {
    console.log(`Fetching FAQ: ${player.name}`);
    const html = await client.getHtml(player.url);
    entries.push({ player, faqs: parseFaqQuestions(html, player) });
  }

  const output = aggregateFaqs(entries);
  const outputDirectory = join(root, 'data', 'output');
  await mkdir(outputDirectory, { recursive: true });
  const path = join(outputDirectory, 'faq-aggregation.json');
  await writeFile(path, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${output.uniqueQuestionCount} question groups to ${path}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
