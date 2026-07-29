import * as cheerio from 'cheerio';
import type { FaqQuestion, Player } from './types.js';

const BASE_URL = 'https://www.baseball-reference.com';
const SUFFIX = /^(Jr\.?|Sr\.?|II|III|IV|V)$/i;

function splitPlayerName(name: string): Pick<Player, 'firstName' | 'lastName'> | undefined {
  const parts = name.split(' ').filter(Boolean);
  const withoutSuffix = parts.filter((part) => !SUFFIX.test(part));
  if (withoutSuffix.length < 2) return undefined;

  const firstName = withoutSuffix[0];
  const penultimate = withoutSuffix.at(-2)!.toLocaleLowerCase();
  const antepenultimate = withoutSuffix.at(-3)?.toLocaleLowerCase();
  const surnameStart = antepenultimate === 'de' && penultimate === 'la'
    ? withoutSuffix.length - 3
    : ['de', 'del'].includes(penultimate)
      ? withoutSuffix.length - 2
      : withoutSuffix.length - 1;

  return { firstName, lastName: withoutSuffix.slice(surnameStart).join(' ') };
}

export function parseDirectory(html: string): Player[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const players: Player[] = [];

  // Player links are repeated in the page's navigation and footer. The directory
  // listing itself is the only source of truth for this letter's players.
  $('div[id^="div_players_"] a[href^="/players/"][href$=".shtml"]').each((_, element) => {
    const name = $(element).text().replace(/\s+/g, ' ').trim();
    const href = $(element).attr('href');
    if (!href || !name || seen.has(href)) return;

    const parsedName = splitPlayerName(name);
    if (!parsedName) return;
    seen.add(href);
    // Preserve the complete display name for FAQ replacement, but retain first/last
    // components separately so suffixes/middle names do not affect the three-a rule.
    players.push({ name, ...parsedName, url: new URL(href, BASE_URL).href });
  });
  return players;
}

export function parseFaqQuestions(html: string, player: Player): FaqQuestion[] {
  const $ = cheerio.load(html);
  const faq = $('#all_faq');
  if (!faq.length) return [];

  const aliases = new Set([player.name, `${player.firstName} ${player.lastName}`]);
  // BR's FAQ content is presently in the FAQ container. Select question headings/links,
  // avoiding answer paragraphs; retain this narrow selector so markup changes are visible.
  const questions: FaqQuestion[] = [];
  faq.find('h2, h3, h4, strong, b').each((_, element) => {
    const question = $(element).text().replace(/\s+/g, ' ').trim();
    if (question.endsWith('?')) questions.push({ question, aliases: [...aliases] });
  });
  return questions;
}
