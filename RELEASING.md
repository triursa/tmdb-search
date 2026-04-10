# Releasing

This document is the release checklist and notes template for TMDB Search.

## One-time setup

Update these placeholder URLs before first public release:

- `manifest.json` -> `authorUrl`
- `package.json` -> `homepage`, `repository.url`, `bugs.url`

Replace `<your-username>` with your GitHub username.

## Release checklist

1. Ensure working tree is clean (except intended release changes).
2. Update version in `manifest.json`.
3. Update `versions.json` with:
   - key: plugin version
   - value: minimum supported Obsidian version
4. Build release bundle:

```bash
npm run build
```

5. Verify release artifacts exist and are up to date:
   - `main.js`
   - `manifest.json`
   - `styles.css`
6. Verify TMDB compliance before tagging:
   - Required attribution notice is present in plugin settings and `README.md`.
   - TMDB logo usage points to an approved TMDB logo asset.
   - `README.md` links include TMDB homepage, logos-attribution page, and API terms page.
   - Rate-limit behavior still retries 429 responses and reports failures clearly.
7. Commit release changes.
8. Create and push tag:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

9. Create a GitHub Release for `vX.Y.Z` and upload:
   - `main.js`
   - `manifest.json`
   - `styles.css`
10. Copy in release notes from template below.

## Release notes template

```markdown
## TMDB Search vX.Y.Z

### Added
- 

### Changed
- 

### Fixed
- 

### Notes
- Minimum Obsidian version: X.Y.Z
- Install/update using release files: main.js, manifest.json, styles.css
```

## Suggested commit message

```text
release: vX.Y.Z
```
