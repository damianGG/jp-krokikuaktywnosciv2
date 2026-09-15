
import Hero4 from "@/components/blocks/hero/Hero4";
import About6 from "@/components/blocks/about/About6";
import { getHomepageContent } from "@/lib/actions/homepage";
import { blobProxyUrl } from "@/lib/blob-proxy";

export default async function Home() {
  const content = await getHomepageContent();
  const heroImageUrl = blobProxyUrl(content.heroImageUrl) ?? content.heroImageUrl;

  return (
    <main >
      <div>
        <Hero4
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
          imageUrl={heroImageUrl}
        />
        <About6 content={content.aboutContent} />
      </div>
    </main>
  );
}
