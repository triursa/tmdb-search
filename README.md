# TMDB Search for Obsidian

Turn your vault into a movie and TV knowledge base.

This plugin lets you search The Movie Database (TMDB), pick a result, and instantly insert a structured note from a template. It is designed for fast capture with minimal typing.

## What it does

- Searches movies and TV shows from TMDB inside Obsidian.
- Pulls rich metadata (title, year, rating, genres, tagline, poster URL, and more).
- Fills customizable templates using placeholders like `{{title}}` and `{{overview}}`.
- Inserts content at the cursor or creates a new note automatically.

## How it works

At a high level, the plugin flow is:

1. Open search from ribbon icon or command palette.
2. Query TMDB with a debounced search call.
3. Select a movie or TV show result.
4. Fetch full details from TMDB.
5. Fill your chosen template by replacing `{{placeholder}}` tokens.
6. Insert into the current note or create a new file.

Main source files:

- `src/main.ts`: plugin lifecycle, command, ribbon button, settings setup.
- `src/modal.ts`: search modal, rendering results, choose result, insert/create note logic.
- `src/tmdb.ts`: TMDB client, API calls, response mapping to plugin data shape.
- `src/template.ts`: token replacement engine for templates.
- `src/settings.ts`: settings UI and default movie/TV templates.

## Requirements

- Obsidian `0.15.0` or newer.
- A TMDB API Read Access Token (Bearer token).

Get a token from TMDB: https://www.themoviedb.org/settings/api

## TMDB attribution and usage

This plugin uses TMDB data and images.

[![TMDB](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg)](https://www.themoviedb.org/about/logos-attribution)

This product uses the TMDB API but is not endorsed or certified by TMDB.

TMDB links:
- Homepage: https://www.themoviedb.org
- Logos and attribution: https://www.themoviedb.org/about/logos-attribution
- API terms: https://www.themoviedb.org/api-terms-of-use

Compliance notes:
- API access is intended for non-commercial use unless you have a separate TMDB commercial agreement.
- This plugin performs direct API requests and does not implement long-term TMDB data caching.
- The plugin automatically retries brief TMDB rate limits before showing an error.

## Install the plugin

### Option A: Install from a GitHub release (recommended for users)

1. Download release files: `main.js`, `manifest.json`, `styles.css`.
2. Create this folder in your vault:
	 - `.obsidian/plugins/tmdb-obsidian-plugin/`
3. Place the three files in that folder.
4. Open Obsidian -> Settings -> Community plugins.
5. Enable `TMDB Search`.

### Option B: Build from source (recommended for contributors)

```bash
npm install
npm run build
```

Build output is `main.js` in the project root.

For development watch mode:

```bash
npm run dev
```

## Configure in Obsidian

1. Open Settings -> TMDB Search.
2. Paste your TMDB API Read Access Token.
   - Security note: your token is stored in Obsidian plugin data. Treat it like a credential and do not share your vault config publicly.
3. Choose insert mode:
	 - `Insert at cursor`
	 - `Create new note`
4. Optionally set a folder for new notes.
5. Customize movie and TV templates.

## Placeholder reference

Common placeholders:

- `{{title}}`
- `{{year}}`
- `{{overview}}`
- `{{rating}}`
- `{{genres}}`
- `{{poster_url}}`
- `{{status}}`
- `{{tagline}}`

Movie-only:

- `{{director}}`
- `{{runtime}}`

TV-only:

- `{{creators}}`
- `{{seasons}}`

Unknown placeholders are preserved as-is, which makes template experimentation safe.

## .claude folder: install, keep local, and remove

The `.claude` folder is optional local tooling config. It is not required for plugin runtime and should stay out of git history.

This repository now ignores `.claude/` via `.gitignore`.

### Install `.claude` locally (optional)

If you want local Claude tooling settings in this repo:

1. Create folder: `.claude`
2. Create file: `.claude/settings.local.json`
3. Add your local config, for example:

```json
{
	"permissions": {
		"allow": [
			"Bash(npm install:*)",
			"Bash(npm run:*)"
		]
	}
}
```

### Remove `.claude` locally

PowerShell:

```powershell
Remove-Item -Recurse -Force .claude
```

Command Prompt:

```bat
rmdir /s /q .claude
```

Removing `.claude` has no impact on the plugin itself.

## Error handling behavior

- Invalid token: shows a settings/token warning.
- Rate limited by TMDB: automatically retries with backoff, then shows a warning if still limited.
- Network failure: shows a network error notice.

## Public release checklist

Before tagging a release:

1. Run `npm run build`.
2. Confirm `manifest.json` version is correct.
3. Confirm `versions.json` maps plugin version -> min Obsidian version.
4. Ensure release includes:
	 - `main.js`
	 - `manifest.json`
	 - `styles.css`
5. Push tag and create GitHub release with those artifacts.

## Obsidian Community plugin prep

This repo is structured for community submission readiness:

- Manifest and versions file present.
- Bundled `main.js` generated with esbuild.
- License included.

Before submitting, double-check current official Obsidian submission requirements and repository metadata.

## License

MIT

