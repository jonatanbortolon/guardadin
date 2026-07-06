import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: [
		"kysely",
		"@neondatabase/serverless",
		"openai",
		"zod",
	],
	webpack(config) {
		config.experiments = {
			asyncWebAssembly: true,
			layers: true,
		};

		return config;
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
};

export default nextConfig;
