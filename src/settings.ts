import { App, PluginSettingTab, Setting } from "obsidian";
import type TMDBPlugin from "./main";

export interface TMDBPluginSettings {
	apiReadAccessToken: string;
	defaultMovieTemplate: string;
	defaultTVTemplate: string;
	insertMode: "cursor" | "newNote";
	newNoteFolder: string;
}

export const DEFAULT_SETTINGS: TMDBPluginSettings = {
	apiReadAccessToken: "",
	insertMode: "cursor",
	newNoteFolder: "",
	defaultMovieTemplate: `---
title: "{{title}}"
year: {{year}}
rating: {{rating}}
genres: [{{genres}}]
director: "{{director}}"
runtime: {{runtime}}
status: "{{status}}"
tagline: "{{tagline}}"
poster: "{{poster_url}}"
---

# {{title}} ({{year}})

> {{tagline}}

{{overview}}

**Director:** {{director}}
**Runtime:** {{runtime}} minutes
**Genres:** {{genres}}
**Rating:** {{rating}}/10
`,
	defaultTVTemplate: `---
title: "{{title}}"
year: {{year}}
rating: {{rating}}
genres: [{{genres}}]
creators: "{{creators}}"
seasons: {{seasons}}
status: "{{status}}"
tagline: "{{tagline}}"
poster: "{{poster_url}}"
---

# {{title}} ({{year}})

> {{tagline}}

{{overview}}

**Created by:** {{creators}}
**Seasons:** {{seasons}}
**Genres:** {{genres}}
**Rating:** {{rating}}/10
`,
};

export class TMDBSettingTab extends PluginSettingTab {
	plugin: TMDBPlugin;

	constructor(app: App, plugin: TMDBPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "TMDB Search Settings" });

		new Setting(containerEl)
			.setName("API Read Access Token")
			.setDesc(
				"Your TMDB API Read Access Token (Bearer). Get one at themoviedb.org under Settings -> API. TMDB usage is subject to https://www.themoviedb.org/api-terms-of-use."
			)
			.addText((text) => {
				text
					.setPlaceholder("eyJhbGciOiJIUzI1NiJ9...")
					.setValue(this.plugin.settings.apiReadAccessToken)
					.onChange(async (value) => {
						this.plugin.settings.apiReadAccessToken = value.trim();
						await this.plugin.saveSettings();
					});
				text.inputEl.type = "password";
				text.inputEl.style.width = "100%";
			});

		new Setting(containerEl)
			.setName("Insert mode")
			.setDesc(
				"Where to put the filled template — at the cursor position, or in a new note."
			)
			.addDropdown((drop) =>
				drop
					.addOption("cursor", "Insert at cursor")
					.addOption("newNote", "Create new note")
					.setValue(this.plugin.settings.insertMode)
					.onChange(async (value) => {
						this.plugin.settings.insertMode = value as
							| "cursor"
							| "newNote";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("New note folder")
			.setDesc(
				'Folder path for new notes (e.g. "Movies"). Leave empty to use vault root.'
			)
			.addText((text) =>
				text
					.setPlaceholder("Movies")
					.setValue(this.plugin.settings.newNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.newNoteFolder = value.trim();
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Templates" });
		containerEl.createEl("p", {
			text: "Available placeholders: {{title}}, {{year}}, {{overview}}, {{rating}}, {{genres}}, {{poster_url}}, {{status}}, {{tagline}}, {{director}} (movie), {{runtime}} (movie), {{creators}} (TV), {{seasons}} (TV)",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Movie template")
			.setDesc("Template used when inserting movie data.")
			.addTextArea((area) => {
				area
					.setValue(this.plugin.settings.defaultMovieTemplate)
					.onChange(async (value) => {
						this.plugin.settings.defaultMovieTemplate = value;
						await this.plugin.saveSettings();
					});
				area.inputEl.rows = 20;
				area.inputEl.style.width = "100%";
				area.inputEl.style.fontFamily = "monospace";
				area.inputEl.style.fontSize = "12px";
			});

		new Setting(containerEl)
			.setName("TV show template")
			.setDesc("Template used when inserting TV show data.")
			.addTextArea((area) => {
				area
					.setValue(this.plugin.settings.defaultTVTemplate)
					.onChange(async (value) => {
						this.plugin.settings.defaultTVTemplate = value;
						await this.plugin.saveSettings();
					});
				area.inputEl.rows = 20;
				area.inputEl.style.width = "100%";
				area.inputEl.style.fontFamily = "monospace";
				area.inputEl.style.fontSize = "12px";
			});

		containerEl.createEl("h3", { text: "TMDB Attribution" });
		const tmdbAttribution = containerEl.createDiv({
			cls: "setting-item-description",
		});
		const tmdbLogoLink = tmdbAttribution.createEl("a", {
			attr: {
				href: "https://www.themoviedb.org/about/logos-attribution",
				target: "_blank",
				rel: "noopener noreferrer",
			},
		});
		tmdbLogoLink.createEl("img", {
			attr: {
				src: "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg",
				alt: "TMDB logo",
				width: "140",
			},
		});
		tmdbAttribution.createEl("p", {
			text: "This product uses the TMDB API but is not endorsed or certified by TMDB.",
		});
		tmdbAttribution.createEl("a", {
			text: "https://www.themoviedb.org",
			attr: {
				href: "https://www.themoviedb.org",
				target: "_blank",
				rel: "noopener noreferrer",
			},
		});
	}
}
