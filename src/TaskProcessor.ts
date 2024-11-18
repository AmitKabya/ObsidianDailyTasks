export class TaskProcessor {
	static extractUncompletedTasks(content: string): Record<string, string[]> {
		const lines = content.split("\n");
		const tasksByHeader: Record<string, string[]> = { "": [] };
		let currentHeader = "";

		for (const line of lines) {
			if (line.startsWith("#")) {
				if (!tasksByHeader[currentHeader].length) {
					delete tasksByHeader[currentHeader];
				}
				currentHeader = line;
				tasksByHeader[currentHeader] = [];
			} else if (line.trim().match(/^- \[ \].+$/)) {
				tasksByHeader[currentHeader].push(line.trim());
			}
		}

		return tasksByHeader;
	}

	static processTemplate(
		template: string,
		allTasks: Record<string, string[]>
	): string {
		let processedContent = template;

		// Process tasks for each header
		for (const [header, tasks] of Object.entries(allTasks)) {
			const tasksContent =
				tasks.length > 0
					? tasks.join("\n")
					: "No tasks from yesterday:)";
			if (header) {
				const sections = processedContent.split(header, 2);
				if (sections.length > 1) {
					sections[1] = sections[1].replace(
						"<<tasks>>",
						tasksContent
					);
					processedContent = sections.join(header);
				}
			}
		}

		// Replace any remaining <<tasks>> placeholders
		while (processedContent.includes("<<tasks>>")) {
			processedContent = processedContent.replace(
				"<<tasks>>",
				"No tasks from yesterday:)"
			);
		}

		return processedContent;
	}
}
