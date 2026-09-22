export const ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';
export const ATTACHMENT_HELP =
  'PDF, JPG, JPEG lub PNG. Maksymalnie 10 plików, 3 MB na plik i 3 MB łącznie. Pliki zostaną wgrane przy zapisie wpisu.';
// Leave room for text and multipart framing below the hosting request limit.
export const MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024;
export const MAX_ATTACHMENTS_SIZE = 3 * 1024 * 1024;
export const MAX_NEWS_TEXT_SIZE = 1024 * 1024;

const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export type NewsFormState = { error?: string; success?: string };

export class NewsValidationError extends Error {}

export function attachmentMimeType(name: string) {
  return mimeTypes[name.split('.').pop()?.toLowerCase() ?? ''];
}

export function validateAttachmentSelection(
  files: Pick<File, 'name' | 'size' | 'type'>[]
): string | null {
  if (files.length > 10) return 'Możesz dodać maksymalnie 10 plików jednocześnie.';
  let total = 0;
  for (const file of files) {
    if (file.name.length > 255 || /[/\\\u0000-\u001f\u007f]/.test(file.name)) {
      return 'Nazwa pliku jest nieprawidłowa lub zbyt długa.';
    }
    const mime = attachmentMimeType(file.name);
    if (!mime || file.type !== mime) {
      return `Plik „${file.name}” musi mieć format PDF, JPG, JPEG lub PNG.`;
    }
    if (file.size === 0 || file.size > MAX_ATTACHMENT_SIZE) {
      return `Plik „${file.name}” jest pusty lub przekracza limit 3 MB.`;
    }
    total += file.size;
  }
  if (total > MAX_ATTACHMENTS_SIZE) return 'Łączny rozmiar nowych plików przekracza 3 MB.';
  return null;
}
