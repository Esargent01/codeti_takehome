# Codeti Baseball Reference FAQ Aggregator

Fetches Baseball Reference's 26 player-directory pages, filters players whose **first and last names** contain exactly three `a` characters (case-insensitive and diacritic-insensitive), then groups their FAQ questions. The resulting JSON reports the total player count and each normalized question's player count.

## Run

```bash
npm install
npm run dev
```

The first run is deliberately slow: requests are serialized and separated by three seconds. HTML is cached under `data/cache/`, so later runs reuse it. To refresh one cached page, remove that specific file; to refresh all pages, run with `--refresh`.

```bash
npm run dev -- --refresh
# Or after building:
npm run build && npm start
```

Output is written to `data/output/faq-aggregation.json`.

## Design decisions

- Directory pages are fetched first; the name filter runs locally before player pages are requested.
- A cached page is considered authoritative for this one-shot exercise. There is no cron/diff job.
- The name count strips diacritics (`Tatís` is treated as `Tatis`) and excludes suffixes/middle names. The original display name, including suffixes such as `Jr.`, remains an FAQ-removal alias. Surname particles such as `de la` and `del` are retained with the last name.
- Suffix aliases tolerate dotted and undotted `Jr.`, `Sr.`, and roman-numeral forms. Possessive FAQ variants such as `Abrams'` and `Jones's`, including when followed by terminal punctuation, collapse to the canonical `{player}'s` question form.
- FAQ equality ignores case and the player name. The extractor also collects FAQ name references when visible, allowing nickname/canonical variants to be stripped. It does **not** erase years or statistics: those remain meaningful question differences until real sampled pages justify broader normalization.
- The HTTP client identifies itself, obeys a conservative three-second crawl interval, and never retries automatically. Re-run after inspecting a cached failure rather than amplifying traffic.

## Verification

```bash
npm test
npm run check
```

## Repository handoff

Before sending the take-home, run the scraper to populate the output, inspect a few cached FAQ blocks, and write the requested debrief in your own words. The brief explicitly asks that the debrief not be AI-written.
