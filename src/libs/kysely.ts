import { neonConfig, Pool } from "@neondatabase/serverless";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import ws from "ws";
import { PgBuiltins } from "@/enums/pg-builtins";
import { UpdatedAtPlugin } from "@/kysely/plugins/updated-at";
import type { Database } from "@/kysely/types";
import { env } from "@/libs/env";

neonConfig.webSocketConstructor = ws;

if (env.NODE_ENV !== "production") {
	neonConfig.wsProxy = (host) => `${host}:5433/v1`;
	neonConfig.useSecureWebSocket = false;
	neonConfig.pipelineTLS = false;
	neonConfig.pipelineConnect = false;
}

const pool = new Pool({
	connectionString: env.DB_URL,
	ssl: env.NODE_ENV === "production",
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
				return (value: string | null) =>
					value === null ? null : Number.parseFloat(String(value));
			}

			if (id === PgBuiltins.JSON || id === PgBuiltins.JSONB) {
				return (value: string | null) =>
					value === null ? null : JSON.parse(String(value));
			}

			if (id === PgBuiltins.BOOL) {
				return (value: string | null) =>
					value === null ? null : value === "t";
			}

			return (value: string | null) => (value === null ? null : value);
		},
	},
});

export const kysely = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool: pool as unknown as ConstructorParameters<
			typeof PostgresDialect
		>[0]["pool"],
	}),
	plugins: [new CamelCasePlugin(), new UpdatedAtPlugin()],
});
