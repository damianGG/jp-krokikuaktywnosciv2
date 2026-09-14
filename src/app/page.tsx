
import Hero4 from "@/components/blocks/hero/Hero4";
import About6 from "@/components/blocks/about/About6";
import { getHomepageContent } from "@/lib/actions/homepage";

export default async function Home() {
  const content = await getHomepageContent();

  return (
    <main >
      <div>
        <Hero4
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
          imageUrl={content.heroImageUrl}
        />
        <About6 content={content.aboutContent} />
      </div>
    </main>
  );
}
