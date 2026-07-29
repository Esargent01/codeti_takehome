import assert from 'node:assert/strict';
import test from 'node:test';
import { hasExactlyThreeAs, normalizeQuestion } from '../src/normalize.js';
import type { Player } from '../src/types.js';

const player = (firstName: string, lastName: string): Player => ({
  name: `${firstName} ${lastName}`,
  firstName,
  lastName,
  url: 'https://example.test/player',
});

test('counts a characters case- and diacritic-insensitively', () => {
  assert.equal(hasExactlyThreeAs(player('Tal', 'Abernathy')), true);
  assert.equal(hasExactlyThreeAs(player('David', 'Aardsma')), false);
  assert.equal(hasExactlyThreeAs(player('Ána', 'Tatis')), true);
});

test('normalizes player names without changing other variables', () => {
  assert.equal(normalizeQuestion('When was David Aardsma born?', ['David Aardsma']), 'when was {player} born?');
  assert.equal(normalizeQuestion('When was HENRY AARON born?', ['Henry Aaron']), 'when was {player} born?');
  assert.notEqual(
    normalizeQuestion('How many home runs did Henry Aaron hit in 1957?', ['Henry Aaron']),
    normalizeQuestion('How many home runs did David Aardsma hit in 1962?', ['David Aardsma']),
  );
});

test('normalizes suffix and possessive variants after replacing the player name', () => {
  assert.equal(
    normalizeQuestion('How many hits does Ronald Acuña Jr. have?', ['Ronald Acuña Jr.', 'Ronald Acuña']),
    'how many hits does {player} have?',
  );
  assert.equal(
    normalizeQuestion("What is Ronald Acuña Jr.'s average?", ['Ronald Acuña Jr.', 'Ronald Acuña Jr']),
    "what is {player}'s average?",
  );
  assert.equal(
    normalizeQuestion('How old is Ronald Acuña Jr.?', ['Ronald Acuña Jr.']),
    'how old is {player}?',
  );
  assert.equal(
    normalizeQuestion('How tall is Ronald Acuña Jr., exactly?', ['Ronald Acuña Jr']),
    'how tall is {player}, exactly?',
  );
  assert.equal(
    normalizeQuestion('Did Ronald Acuña III. play?', ['Ronald Acuña III']),
    'did {player} play?',
  );
  assert.equal(
    normalizeQuestion("What are Cal Abrams' nicknames?", ['Cal Abrams']),
    "what are {player}'s nicknames?",
  );
  assert.equal(
    normalizeQuestion("What are Bob Jones's nicknames?", ['Bob Jones']),
    "what are {player}'s nicknames?",
  );
  assert.equal(
    normalizeQuestion("Are Cal Abrams'?”", ['Cal Abrams']),
    "are {player}'s?”",
  );
});
