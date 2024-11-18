// settings.ts
import { App, PluginSettingTab, Setting, TFile } from "obsidian";
import TaskMoverPlugin from "../main";

export class TaskMoverSettingTab extends PluginSettingTab {
	private templateFileSearchEl: HTMLInputElement;

	constructor(app: App, private plugin: TaskMoverPlugin) {
		super(app, plugin);
	}

	private async getSuggestedTemplateFiles(input: string): Promise<TFile[]> {
		const files = this.app.vault.getMarkdownFiles();
		const inputLower = input.toLowerCase();

		return files
			.filter((file) => file.path.toLowerCase().contains(inputLower))
			.sort((a, b) => {
				const aStartsWith = a.path.toLowerCase().startsWith(inputLower);
				const bStartsWith = b.path.toLowerCase().startsWith(inputLower);
				if (aStartsWith && !bStartsWith) return -1;
				if (!aStartsWith && bStartsWith) return 1;
				return a.path.localeCompare(b.path);
			});
	}

	private createTemplateSuggestion(
		suggestionsEl: HTMLElement,
		file: TFile
	): HTMLElement {
		const suggestionEl = suggestionsEl.createEl("div", {
			text: file.path,
			cls: "template-suggestion",
		});

		// Apply styles
		Object.assign(suggestionEl.style, {
			padding: "8px",
			cursor: "pointer",
			borderBottom: "1px solid var(--background-modifier-border)",
		});

		// Add event listeners
		suggestionEl.addEventListener("click", async () => {
			this.plugin.settings.templatePath = file.path;
			await this.plugin.saveSettings();
			this.templateFileSearchEl.value = file.path;
			suggestionsEl.remove();
		});

		suggestionEl.addEventListener("mouseover", () => {
			suggestionEl.style.backgroundColor =
				"var(--background-modifier-hover)";
		});

		suggestionEl.addEventListener("mouseout", () => {
			suggestionEl.style.backgroundColor = "";
		});

		return suggestionEl;
	}

	private async updateTemplateSuggestions(
		input: string,
		containerEl: HTMLElement
	) {
		const files = await this.getSuggestedTemplateFiles(input);

		// Remove existing suggestions
		containerEl.querySelector(".template-suggestions")?.remove();

		if (files.length > 0 && input) {
			const suggestionsEl = containerEl.createEl("div", {
				cls: "template-suggestions",
			});

			// Apply styles
			Object.assign(suggestionsEl.style, {
				maxHeight: "200px",
				overflowY: "auto",
				border: "1px solid var(--background-modifier-border)",
				borderRadius: "4px",
				marginTop: "8px",
			});

			// Create suggestions
			files
				.slice(0, 10)
				.forEach((file) =>
					this.createTemplateSuggestion(suggestionsEl, file)
				);
		}
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Daily Notes Folder Setting
		new Setting(containerEl)
			.setName("Daily Notes Folder")
			.setDesc(
				'Folder path where daily notes are stored (e.g., "Daily Notes" or "Journal/Daily")'
			)
			.addText((text) =>
				text
					.setPlaceholder("Daily Notes")
					.setValue(this.plugin.settings.dailyNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteFolder = value;
						await this.plugin.saveSettings();
					})
			);

		// Daily Note Format Setting
		new Setting(containerEl)
			.setName("Daily Note Format")
			.setDesc("Format of daily note filenames (moment.js format)")
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dailyNoteFormat)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteFormat = value;
						await this.plugin.saveSettings();
					})
			);

		// Open Note After Moving Tasks Setting
		new Setting(containerEl)
			.setName("Open Note After Moving Tasks")
			.setDesc("Automatically open today's note after moving tasks")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openNoteAfterMove)
					.onChange(async (value) => {
						this.plugin.settings.openNoteAfterMove = value;
						await this.plugin.saveSettings();
					})
			);

		// Use Template Setting
		new Setting(containerEl)
			.setName("Use Template")
			.setDesc("Use template when creating new daily notes")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.createEmptyNote)
					.onChange(async (value) => {
						this.plugin.settings.createEmptyNote = value;
						await this.plugin.saveSettings();
					})
			);

		// Template File Selection Setting
		new Setting(containerEl)
			.setName("Template File")
			.setDesc(
				"Select a template file from your vault (must contain <<tasks>> placeholder)"
			)
			.addText((text) => {
				this.templateFileSearchEl = text.inputEl;
				text.setPlaceholder("Type to search template files")
					.setValue(this.plugin.settings.templatePath)
					.onChange(async (value) => {
						await this.updateTemplateSuggestions(
							value,
							containerEl
						);
					});
			});

		// Template Help Text
		const templateHelp = containerEl.createEl("div", {
			cls: "setting-item-description",
			text: [
				"Template Requirements:",
				"• Template file must contain <<tasks>> placeholder",
				"• Place <<tasks>> under any header level",
				'• If no tasks exist, "No tasks from yesterday :)" will be shown',
			].join("\n"),
		});

		templateHelp.style.whiteSpace = "pre-line";
	}
}
