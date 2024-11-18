import { Plugin, TFile, Notice, moment } from "obsidian";
import { TaskMoverSettings, DEFAULT_SETTINGS } from "./src/types";
import { FileManager } from "./src/FileManager";
import { TaskProcessor } from "./src/TaskProcessor";
import { TemplateManager } from "./src/TemplateManager";
import { TaskMoverSettingTab } from "./src/settings";

export default class TaskMoverPlugin extends Plugin {
	settings: TaskMoverSettings;
	private fileManager: FileManager;
	private templateManager: TemplateManager;

	async onload() {
		await this.loadSettings();
		this.fileManager = new FileManager(this.app);
		this.templateManager = new TemplateManager(this.app);

		this.addCommands();
		this.addSettingTab(new TaskMoverSettingTab(this.app, this));
	}

	private addCommands() {
		this.addRibbonIcon("arrow-right", "Move uncompleted tasks", () =>
			this.moveUncompletedTasks()
		);

		this.addCommand({
			id: "move-uncompleted-tasks",
			name: "Move uncompleted tasks from previous day",
			callback: () => this.moveUncompletedTasks(),
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async moveUncompletedTasks() {
		try {
			const today = moment();
			const yesterday = moment().subtract(1, "day");

			// Get yesterday's tasks
			const yesterdayPath = this.fileManager.getFilePath(
				yesterday,
				this.settings.dailyNoteFolder
			);
			const yesterdayFile = await this.getYesterdayFile(yesterdayPath);
			const yesterdayContent = await this.fileManager.readFile(
				yesterdayFile
			);
			const uncompletedTasks =
				TaskProcessor.extractUncompletedTasks(yesterdayContent);

			// Process today's note
			const todayPath = this.fileManager.getFilePath(
				today,
				this.settings.dailyNoteFolder
			);
			const templateContent = this.settings.createEmptyNote
				? await this.templateManager.getTemplateContent(
						this.settings.templatePath
				  )
				: "";

			const todayFile = await this.fileManager.getOrCreateFile(
				todayPath,
				templateContent
			);
			const todayContent = await this.fileManager.readFile(todayFile);

			// Update today's note with tasks
			const updatedContent = TaskProcessor.processTemplate(
				todayContent,
				uncompletedTasks
			);
			await this.fileManager.modifyFile(todayFile, updatedContent);

			new Notice(`Tasks moved successfully to today's note`);

			if (this.settings.openNoteAfterMove) {
				const leaf = this.app.workspace.getUnpinnedLeaf();
				await leaf.openFile(todayFile);
			}
		} catch (error) {
			new Notice(`Error moving tasks: ${error.message}`);
		}
	}

	private async getYesterdayFile(path: string): Promise<TFile> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			throw new Error(`Previous day note not found at ${path}`);
		}
		return file;
	}
}
