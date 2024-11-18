import { App, TFile, normalizePath } from "obsidian";

export class FileManager {
	constructor(private app: App) {}

	getFilePath(date: moment.Moment, folder: string): string {
		const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
		const fileName = `${date.format("YYYY-MM-DD")}.md`;
		return normalizePath(
			normalizedFolder ? `${normalizedFolder}/${fileName}` : fileName
		);
	}

	async ensureFolder(folderPath: string): Promise<void> {
		if (folderPath) {
			await this.app.vault.createFolder(folderPath).catch(() => {});
		}
	}

	async getOrCreateFile(path: string, content: string): Promise<TFile> {
		const existingFile = this.app.vault.getAbstractFileByPath(path);
		if (existingFile instanceof TFile) {
			return existingFile;
		}

		try {
			const folder = path.split("/").slice(0, -1).join("/");
			await this.ensureFolder(folder);
			return await this.app.vault.create(path, content);
		} catch (error) {
			throw new Error(
				`Failed to create file at ${path}: ${error.message}`
			);
		}
	}

	async readFile(file: TFile): Promise<string> {
		try {
			return await this.app.vault.read(file);
		} catch (error) {
			throw new Error(
				`Failed to read file ${file.path}: ${error.message}`
			);
		}
	}

	async modifyFile(file: TFile, content: string): Promise<void> {
		try {
			await this.app.vault.modify(file, content);
		} catch (error) {
			throw new Error(
				`Failed to modify file ${file.path}: ${error.message}`
			);
		}
	}
}
