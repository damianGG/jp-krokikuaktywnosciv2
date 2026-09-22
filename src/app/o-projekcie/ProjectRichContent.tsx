import { sanitizeRichContent } from '@/lib/rich-content';

export default function ProjectRichContent({ content }: { content: string }) {
  if (!content?.trim()) return null;

  return (
    <div
      className="projectRichContent"
      dangerouslySetInnerHTML={{ __html: sanitizeRichContent(content) }}
    />
  );
}
