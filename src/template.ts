import type { MediaData } from "./tmdb";

/**
 * Replaces all {{key}} tokens in the template with values from data.
 * Unknown placeholders are left as-is (not stripped).
 */
export function fillTemplate(template: string, data: MediaData): string {
	return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
		if (key in data) {
			return data[key as keyof MediaData] as string;
		}
		return match;
	});
}

/**
 * Returns all {{key}} tokens found in the template string.
 */
export function extractPlaceholders(template: string): string[] {
	const matches: string[] = [];
	const regex = /\{\{(\w+)\}\}/g;
	let m: RegExpExecArray | null;
	while ((m = regex.exec(template)) !== null) {
		matches.push(m[1]);
	}
	return [...new Set(matches)];
}
