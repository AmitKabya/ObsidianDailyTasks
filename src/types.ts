export interface TaskMoverSettings {
	dailyNoteFolder: string;
	dailyNoteFormat: string;
	openNoteAfterMove: boolean;
	templatePath: string;
	createEmptyNote: boolean;
}

export const DEFAULT_SETTINGS: TaskMoverSettings = {
	dailyNoteFolder: "/",
	dailyNoteFormat: "YYYY-MM-DD",
	openNoteAfterMove: true,
	templatePath: "",
	createEmptyNote: true,
};

export interface TaskPosition {
	line: number;
	level: number;
	checked: boolean;
}
