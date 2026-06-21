export default function robots() {
  const baseUrl = "https://redactoraiapp.com"; 
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
