# Contributing

Thanks for helping improve TMDB Search for Obsidian.

## Development setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Start watch build:

```bash
npm run dev
```

4. For production build:

```bash
npm run build
```

## Project structure

- `src/main.ts`: plugin lifecycle, command registration, ribbon action.
- `src/modal.ts`: TMDB search UI and insert/create-note flow.
- `src/tmdb.ts`: TMDB API client and response mapping.
- `src/template.ts`: template placeholder replacement.
- `src/settings.ts`: settings tab and default templates.
- `manifest.json`: Obsidian plugin metadata.
- `versions.json`: plugin version to minimum Obsidian version mapping.

## Coding guidelines

- Keep changes focused and minimal.
- Preserve existing behavior unless the change explicitly targets behavior updates.
- Match existing TypeScript style and formatting.
- Update docs when settings, commands, placeholders, or release steps change.

## Submitting changes

1. Create a branch from `main`.
2. Make your changes.
3. Run `npm run build` and ensure it succeeds.
4. Commit with a clear message.
5. Open a pull request with:
   - Summary of what changed
   - Why it changed
   - How it was tested

## TMDB compliance requirements

When changing API behavior or user-facing docs, preserve TMDB compliance:

- Keep the TMDB attribution notice visible in plugin settings and README.
- Do not modify TMDB logos; use approved assets from TMDB logos page.
- Do not add long-term TMDB data caching.
- Keep request behavior rate-limit aware.
- Do not add TMDB data usage for ML/AI training workflows.

## Pull request checklist

- [ ] Build passes (`npm run build`)
- [ ] Documentation updated if needed
- [ ] TMDB attribution and compliance language still present
- [ ] `manifest.json` version updated if release-facing
- [ ] `versions.json` updated to match plugin version compatibility
- [ ] Release artifacts verified (`main.js`, `manifest.json`, `styles.css`)

## Local-only files

- `.claude/` is optional local AI tooling config and is intentionally ignored.
- Do not commit personal/local environment files.
