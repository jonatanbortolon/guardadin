import { PgBuiltins } from "@/enums/pg-builtins";
import { UpdatedAtPlugin } from "@/kysely/plugins/updated-at";
import { Database } from "@/kysely/types";
import { env } from "@/libs/env";
import { CamelCasePlugin, Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import ws from "ws";

const dialect = new NeonDialect({
	connectionString: env.DB_URL,
	ssl: env.NODE_ENV === "production",
	poolQueryViaFetch: env.NODE_ENV === "production" ? true : undefined,
	wsProxy:
		env.NODE_ENV === "production" ? undefined : (host) => `${host}:5433/v1`,
	useSecureWebSocket: env.NODE_ENV === "production" ? undefined : false,
	pipelineTLS: env.NODE_ENV === "production" ? undefined : false,
	pipelineConnect: env.NODE_ENV === "production" ? undefined : false,
	webSocketConstructor: ws,
	types: {
		getTypeParser(id) {
			if (
				id === PgBuiltins.NUMERIC ||
				id === PgBuiltins.INT2 ||
				id === PgBuiltins.INT4 ||
				id === PgBuiltins.INT8 ||
				id === PgBuiltins.FLOAT4 ||
				id === PgBuiltins.FLOAT8
			) {
				return (value: any) =>
					value === null ? null : Number.parseFloat(String(value));
			}

			if (id === PgBuiltins.JSON || id === PgBuiltins.JSONB) {
				return (value: any) =>
					value === null ? null : JSON.parse(String(value));
			}

			if (id === PgBuiltins.BOOL) {
				return (value: any) => (value === null ? null : value === "t");
			}

			return (value: any) => (value === null ? null : value);
		},
	},
});

export const kysely = new Kysely<Database>({
	dialect,
	plugins: [new CamelCasePlugin(), new UpdatedAtPlugin()],
});
