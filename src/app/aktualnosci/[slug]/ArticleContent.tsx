import { sanitizeRichContent } from '@/lib/rich-content';

export default function ArticleContent({ content }: { content: string }) {
  return (
    <div
      className="richContent"
      dangerouslySetInnerHTML={{ __html: sanitizeRichContent(content) }}
    />
  );
}
