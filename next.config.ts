import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",

  // GitHub Pages serves from /fotoportfoolia/ subpath
  basePath: isGithubPages ? "/fotoportfoolia" : "",
  assetPrefix: isGithubPages ? "/fotoportfoolia/" : "",

  // Trailing slashes needed for static file hosting
  trailingSlash: true,

  images: {
    // Static export can't use Next.js image optimization server
    unoptimized: true,
  },
};

export default nextConfig;
