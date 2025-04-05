export function parseFormData(formData: FormData) {
	const formDataEntries: Record<string, unknown> = Object.fromEntries(formData);

	for (const [key, value] of Object.entries(formDataEntries)) {
		if (value === "null") {
			formDataEntries[key] = null;
		}

		if (value === "on") {
			formDataEntries[key] = true;
		}

		if (value === "off") {
			formDataEntries[key] = false;
		}
	}

	return formDataEntries;
}
