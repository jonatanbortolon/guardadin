export type BaseActionErrorReturn<
	T extends Record<string, string[]> | undefined = undefined,
> =
	| {
			errors?: T;
			message?: string;
	  }
	| undefined;
