// Online-only installation metadata. Project data always comes from authenticated server routes.
export const webAppManifest = {
  id: "/",
  name: "Solutions HQ",
  short_name: "SolutionsHQ",
  description: "Your project workspace, portfolio, and AI development control center.",
  lang: "en-US",
  start_url: "/",
  scope: "/",
  display: "standalone" as const,
  background_color: "#0b0d10",
  theme_color: "#0b0d10",
  orientation: "any" as const,
  prefer_related_applications: false,
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" as const },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" as const },
    { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" as const },
  ],
};
