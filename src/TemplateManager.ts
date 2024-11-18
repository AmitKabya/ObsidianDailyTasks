// TemplateManager.ts
import { App, Notice, TFile } from "obsidian";

export class TemplateManager {
	constructor(private app: App) {}

	private readonly DEFAULT_TEMPLATE =
		"# Daily Note\n\n## Tasks from Yesterday\n<<tasks>>\n\n## Today's Tasks\n";

	async getTemplateContent(templatePath: string): Promise<string> {
		if (!templatePath) {
			return this.DEFAULT_TEMPLATE;
		}

		try {
			const templateFile =
				this.app.vault.getAbstractFileByPath(templatePath);
			if (templateFile instanceof TFile) {
				return await this.app.vault.read(templateFile);
			}
			return this.DEFAULT_TEMPLATE;
		} catch (error) {
			new Notice(`Error reading template: ${error.message}`);
			return this.DEFAULT_TEMPLATE;
		}
	}
}
