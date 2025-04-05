import {
	ColumnNode,
	ColumnUpdateNode,
	KyselyPlugin,
	PluginTransformQueryArgs,
	PluginTransformResultArgs,
	QueryResult,
	RootOperationNode,
	UnknownRow,
	ValueNode,
} from "kysely";

export class UpdatedAtPlugin implements KyselyPlugin {
	transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
		if (args.node.kind === "UpdateQueryNode") {
			const arr: ColumnUpdateNode[] = [];

			arr.push(...(args.node.updates as ColumnUpdateNode[]));
			arr.push(
				ColumnUpdateNode.create(
					ColumnNode.create("updated_at"),
					ValueNode.create(new Date().toISOString()),
				),
			);

			return {
				...args.node,
				updates: arr,
			};
		}

		return args.node;
	}

	transformResult(
		args: PluginTransformResultArgs,
	): Promise<QueryResult<UnknownRow>> {
		return Promise.resolve(args.result);
	}
}
