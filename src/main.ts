import { Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	TMDBPluginSettings,
	TMDBSettingTab,
} from "./settings";
import { TMDBClient } from "./tmdb";
import { TMDBSearchModal } from "./modal";

export default class TMDBPlugin extends Plugin {
	settings: TMDBPluginSettings;
	client: TMDBClient;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.initializeClient();

		this.addRibbonIcon("film", "Search TMDB", () => {
			this.openSearchModal();
		});

		this.addCommand({
			id: "tmdb-search",
			name: "Search TMDB for movie or TV show",
			callback: () => {
				this.openSearchModal();
			},
		});

		this.addSettingTab(new TMDBSettingTab(this.app, this));
	}

	async onunload(): Promise<void> {
		// registered items are cleaned up automatically
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.initializeClient();
	}

	private initializeClient(): void {
		this.client = new TMDBClient(this.settings.apiReadAccessToken);
	}

	private openSearchModal(): void {
		if (!this.settings.apiReadAccessToken) {
			new Notice(
				"TMDB: Please set your API Read Access Token in settings."
			);
			return;
		}
		new TMDBSearchModal(this.app, this.client, this.settings).open();
	}
}
