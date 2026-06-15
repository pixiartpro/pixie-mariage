/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "pixie-mariage";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : undefined,
};

export default nextConfig;
