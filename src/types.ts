export interface Player {
  name: string;
  firstName: string;
  lastName: string;
  url: string;
}

export interface FaqQuestion {
  question: string;
  aliases: string[];
}

export interface QuestionAggregate {
  normalizedQuestion: string;
  exampleQuestion: string;
  playerCount: number;
  playerIds: string[];
}

export interface AggregationOutput {
  generatedAt: string;
  totalPlayersAggregated: number;
  uniqueQuestionCount: number;
  questions: QuestionAggregate[];
}
