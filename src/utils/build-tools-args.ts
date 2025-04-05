export function buildToolsArgs(
	userId: number,
	functionName: string,
	args: any,
) {
	const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

	if (functionName === "create_transaction") {
		return {
			...parsedArgs,
			totalParcels: parsedArgs.totalParcels || 1,
			boughtAt: parsedArgs.boughtAt
				? new Date(parsedArgs.boughtAt)
				: new Date(),
			userId,
		};
	}

	if (functionName === "delete_transaction") {
		return {
			...parsedArgs,
			userId,
		};
	}

	return parsedArgs;
}
