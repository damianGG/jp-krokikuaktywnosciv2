import sanitizeHtml from 'sanitize-html';

export function sanitizeRichContent(content: string) {
  const html = /<\/?[a-z][^>]*>/i.test(content)
    ? content
    : content
        .split(/\n{2,}/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph) =>
          `<p>${paragraph.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`,
        )
        .join('');

  const options: sanitizeHtml.IOptions = {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
      'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      ol: ['start'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        if (!/^(https?:|mailto:|\/(?!\/)|#)/i.test(attributes.href ?? '')) {
          return { tagName: 'span', attribs: {} };
        }

        return {
          tagName: 'a',
          attribs: {
            href: attributes.href,
            ...(attributes.target === '_blank'
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {}),
          },
        };
      },
    },
  };

  // Normalize one extra CMS encoding layer without converting entities into
  // markup. Sanitize again so decoded link attributes are also validated.
  const normalized = sanitizeHtml(html, options)
    .replace(/&amp;((?:[a-z][a-z0-9]+|#\d+|#x[\da-f]+);)/gi, '&$1');

  return sanitizeHtml(normalized, options);
}
