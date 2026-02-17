/** @type {import('next').NextConfig} */
const repo = "smrtcooks-web";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`
};

export default nextConfig;
