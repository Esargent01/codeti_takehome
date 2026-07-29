import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDirectory, parseFaqQuestions } from '../src/parser.js';
import type { Player } from '../src/types.js';

test('parses FAQ h3 questions from the Baseball Reference FAQ section', () => {
  const player: Player = {
    name: 'David Aardsma', firstName: 'David', lastName: 'Aardsma', url: 'https://example.test/aardsda01.shtml',
  };
  const html = `
    <div class="section_wrapper" id="all_faq">
      <div class="section_heading"><h2>Frequently Asked Questions</h2></div>
      <div class="section_content"><h3>When was David Aardsma born?</h3><p>December 27, 1981.</p></div>
    </div>`;
  assert.deepEqual(parseFaqQuestions(html, player).map(({ question }) => question), ['When was David Aardsma born?']);
});

test('keeps suffixes for FAQ matching while excluding them and middle names from name components', () => {
  const html = '<div id="div_players_"><a href="/players/a/example01.shtml">Ana Maria Álvarez Jr.</a></div>';
  assert.deepEqual(parseDirectory(html), [{
    name: 'Ana Maria Álvarez Jr.', firstName: 'Ana', lastName: 'Álvarez', url: 'https://www.baseball-reference.com/players/a/example01.shtml',
  }]);
});

test('attaches de la and del particles to the last name', () => {
  const html = `
    <div id="div_players_">
      <a href="/players/m/maza01.shtml">Roland de la Maza</a>
      <a href="/players/c/cast01.shtml">Adrian del Castillo</a>
    </div>`;
  assert.deepEqual(parseDirectory(html).map(({ firstName, lastName }) => ({ firstName, lastName })), [
    { firstName: 'Roland', lastName: 'de la Maza' },
    { firstName: 'Adrian', lastName: 'del Castillo' },
  ]);
});

test('ignores player links repeated in navigation and the footer', () => {
  const html = `
    <nav><a href="/players/a/acunaro01.shtml">Ronald Acuña Jr.</a></nav>
    <div id="div_players_"><a href="/players/a/acunaro01.shtml">Ronald Acuña Jr.</a></div>
    <div id="bottom_nav"><a href="/players/a/acunaro01.shtml">Ronald Acuña Jr.</a></div>
    <footer><a href="/players/a/acunaro01.shtml">Ronald Acuña Jr.</a></footer>`;
  assert.deepEqual(parseDirectory(html).map(({ name }) => name), ['Ronald Acuña Jr.']);
});
