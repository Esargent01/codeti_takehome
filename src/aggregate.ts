import { normalizeQuestion } from './normalize.js';
import type { AggregationOutput, FaqQuestion, Player, QuestionAggregate } from './types.js';

export function aggregateFaqs(entries: Array<{ player: Player; faqs: FaqQuestion[] }>): AggregationOutput {
  const groups = new Map<string, QuestionAggregate>();
  for (const { player, faqs } of entries) {
    const playerId = player.url;
    for (const faq of faqs) {
      const normalizedQuestion = normalizeQuestion(faq.question, [player.name, ...faq.aliases]);
      const existing = groups.get(normalizedQuestion);
      if (existing) {
        if (!existing.playerIds.includes(playerId)) {
          existing.playerIds.push(playerId);
          existing.playerCount += 1;
        }
      } else {
        groups.set(normalizedQuestion, {
          normalizedQuestion,
          exampleQuestion: faq.question,
          playerCount: 1,
          playerIds: [playerId],
        });
      }
    }
  }
  const questions = [...groups.values()].sort((a, b) => b.playerCount - a.playerCount || a.normalizedQuestion.localeCompare(b.normalizedQuestion));
  return {
    generatedAt: new Date().toISOString(),
    totalPlayersAggregated: entries.length,
    uniqueQuestionCount: questions.length,
    questions,
  };
}
