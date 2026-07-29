import type { Player } from './types.js';

export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLocaleLowerCase();
}

function aliasesWithSuffixVariants(aliases: string[]): string[] {
  const variants = new Set<string>();
  for (const alias of aliases) {
    const folded = fold(alias);
    variants.add(folded);

    // A directory and its FAQ can disagree on whether a suffix has a period.
    // Keep both whole-name variants, so replacement consumes the suffix period
    // before any trailing question punctuation (for example, "Jr.?").
    if (/\b(jr|sr|ii|iii|iv|v)\.?$/i.test(folded)) {
      variants.add(folded.replace(/\.$/, ''));
      variants.add(folded.endsWith('.') ? folded : `${folded}.`);
    }
  }
  return [...variants];
}

export function hasExactlyThreeAs(player: Player): boolean {
  return (fold(`${player.firstName}${player.lastName}`).match(/a/g) ?? []).length === 3;
}

export function normalizeQuestion(question: string, aliases: string[]): string {
  let normalized = fold(question);
  for (const alias of aliasesWithSuffixVariants(aliases).sort((a, b) => b.length - a.length)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (escaped) normalized = normalized.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu'), '{player}');
  }
  // Baseball Reference uses both Jones's and Abrams' possessive styles. Once the
  // name has become a placeholder, make both spellings one canonical question.
  return normalized
    .replace(/\{player\}'(?=[\s\p{P}]|$)/gu, "{player}'s")
    .replace(/\s+/g, ' ')
    .trim();
}
