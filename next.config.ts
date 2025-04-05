import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: [
		"jose",
		"kysely",
		"@neondatabase/serverless",
		"kysely-neon",
		"openai",
		"zod",
	],
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
};

export default nextConfig;
