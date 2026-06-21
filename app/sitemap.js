import { seoPages } from "./tools/seoData";

export default async function sitemap() {
  const baseUrl = "https://redactoraiapp.com"; 

  const toolUrls = Object.keys(seoPages).map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolUrls,
  ];
}
