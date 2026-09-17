import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy same-origin /api/* calls to the backend so the browser never needs
    // a cross-origin base URL. Override the target with BACKEND_ORIGIN.
    const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  // Recharts 3 pulls @reduxjs/toolkit; Next 15 webpack ESM resolution breaks
  // createSlice → runtime "a[d] is not a function". Pin the CJS build.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@reduxjs/toolkit": path.join(
        root,
        "node_modules",
        "@reduxjs",
        "toolkit",
        "dist",
        "cjs",
        "index.js",
      ),
    };
    return config;
  },
};

export default nextConfig;
