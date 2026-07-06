export function fieldError(required: string, invalid: string) {
	return {
		error: (issue: { input?: unknown }) =>
			issue.input === undefined ? required : invalid,
	};
}
