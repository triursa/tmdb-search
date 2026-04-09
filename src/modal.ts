import { App, MarkdownView, Notice, SuggestModal, TFile } from "obsidian";
import { TMDBClient, TMDBError, TMDBSearchResult, MediaData } from "./tmdb";
import { TMDBPluginSettings } from "./settings";
import { fillTemplate } from "./template";

export class TMDBSearchModal extends SuggestModal<TMDBSearchResult> {
	private client: TMDBClient;
	private settings: TMDBPluginSettings;
	private debounceTimer: number | null = null;
	private readonly DEBOUNCE_MS = 400;

	constructor(
		app: App,
		client: TMDBClient,
		settings: TMDBPluginSettings
	) {
		super(app);
		this.client = client;
		this.settings = settings;
		this.setPlaceholder("Search for a movie or TV show...");
	}

	getSuggestions(query: string): Promise<TMDBSearchResult[]> {
		return new Promise((resolve) => {
			if (this.debounceTimer !== null) {
				window.clearTimeout(this.debounceTimer);
			}
			if (!query.trim()) {
				resolve([]);
				return;
			}
			this.debounceTimer = window.setTimeout(async () => {
				try {
					const results = await this.client.searchMulti(query);
					resolve(results);
				} catch (e) {
					this.handleError(e);
					resolve([]);
				}
			}, this.DEBOUNCE_MS);
		});
	}

	renderSuggestion(result: TMDBSearchResult, el: HTMLElement): void {
		const { title, year } = this.getDisplayInfo(result);
		const isMovie = result.media_type === "movie";

		const item = el.createDiv({ cls: "tmdb-result-item" });
		const main = item.createDiv({ cls: "tmdb-result-main" });

		main.createSpan({
			cls: "tmdb-result-title",
			text: year ? `${title} (${year})` : title,
		});

		main.createSpan({
			cls: `tmdb-result-badge ${isMovie ? "tmdb-badge-movie" : "tmdb-badge-tv"}`,
			text: isMovie ? "Movie" : "TV",
		});

		if (result.overview) {
			item.createDiv({
				cls: "tmdb-result-overview",
				text: result.overview,
			});
		}
	}

	async onChooseSuggestion(
		result: TMDBSearchResult,
		_evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		try {
			const isMovie = result.media_type === "movie";
			const mediaData = isMovie
				? await this.client.getMovieDetails(result.id)
				: await this.client.getTVDetails(result.id);

			const template = isMovie
				? this.settings.defaultMovieTemplate
				: this.settings.defaultTVTemplate;

			const filled = fillTemplate(template, mediaData);

			if (this.settings.insertMode === "cursor") {
				this.insertAtCursor(filled);
			} else {
				await this.createNewNote(filled, mediaData);
			}

			new Notice(`Added: ${mediaData.title}`);
		} catch (e) {
			this.handleError(e);
		}
	}

	private insertAtCursor(content: string): void {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice("No active markdown editor found.");
			return;
		}
		activeView.editor.replaceSelection(content);
	}

	private async createNewNote(
		content: string,
		data: MediaData
	): Promise<void> {
		const sanitized = data.title.replace(/[\\/:*?"<>|]/g, "-");
		const baseName = data.year
			? `${sanitized} (${data.year})`
			: sanitized;

		const folder = this.settings.newNoteFolder
			? this.settings.newNoteFolder.replace(/\/$/, "")
			: "";

		const buildPath = (suffix: string) => {
			const name = suffix ? `${baseName} ${suffix}` : baseName;
			return folder ? `${folder}/${name}.md` : `${name}.md`;
		};

		let path = buildPath("");
		let counter = 2;
		while (
			this.app.vault.getAbstractFileByPath(path) instanceof TFile &&
			counter <= 99
		) {
			path = buildPath(String(counter));
			counter++;
		}

		const file = await this.app.vault.create(path, content);
		await this.app.workspace.getLeaf(false).openFile(file);
	}

	private getDisplayInfo(result: TMDBSearchResult): {
		title: string;
		year: string;
	} {
		const title =
			result.media_type === "movie"
				? result.title ?? result.name ?? "Unknown"
				: result.name ?? result.title ?? "Unknown";

		const dateStr =
			result.media_type === "movie"
				? result.release_date
				: result.first_air_date;

		const year = dateStr ? dateStr.substring(0, 4) : "";

		return { title, year };
	}

	private handleError(error: unknown): void {
		if (error instanceof TMDBError) {
			if (error.isAuthError) {
				new Notice(
					"TMDB: Invalid API token. Check your settings."
				);
			} else if (error.statusCode === 429) {
				new Notice("TMDB: Too many requests. Please wait a moment.");
			} else {
				new Notice(`TMDB error: ${error.message}`);
			}
		} else if (error instanceof TypeError) {
			new Notice("TMDB: Network error. Check your connection.");
		} else {
			new Notice("TMDB: An unexpected error occurred.");
		}
	}
}
