import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: "standalone",
    allowedDevOrigins: ["127.0.0.1"],
    serverExternalPackages: ["@valkey/valkey-glide"],
};

export default nextConfig;
