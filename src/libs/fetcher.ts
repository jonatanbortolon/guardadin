export class ApiError extends Error {
	status: number;
	errors?: Record<string, string[] | undefined>;

	constructor(
		status: number,
		body: { message?: string; errors?: Record<string, string[]> } | null,
	) {
		super(body?.message ?? "Tivemos um problema no servidor");
		this.status = status;
		this.errors = body?.errors;
	}
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new ApiError(response.status, body);
	}

	return response.json() as Promise<T>;
}

type QueryValue = string | number | boolean | null | undefined | number[];

export function buildQuery(params: Record<string, QueryValue>): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === "") {
			continue;
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				searchParams.append(key, String(item));
			}
			continue;
		}

		searchParams.set(key, String(value));
	}

	const query = searchParams.toString();

	return query ? `?${query}` : "";
}
