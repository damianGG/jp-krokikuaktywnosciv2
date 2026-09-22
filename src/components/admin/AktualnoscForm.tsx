'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HELP,
  MAX_NEWS_TEXT_SIZE,
  NewsFormState,
  validateAttachmentSelection,
} from '@/lib/aktualnosci-attachments';
import SubmitButton from './SubmitButton';
import styles from './admin.module.scss';

export default function AktualnoscForm({
  action,
  children,
  submitLabel,
}: {
  action: (data: FormData) => Promise<NewsFormState>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(
    (_previous: NewsFormState, data: FormData) => action(data),
    {}
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      if (input.current) input.current.value = '';
      setFiles([]);
      setError(null);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className={styles.card}
      onSubmit={(event) => {
        const form = event.currentTarget;
        const uploadingCover = form.querySelector<HTMLInputElement>('#coverImage')?.disabled;
        const data = new FormData(form);
        const textSize = Array.from(data.values()).reduce(
          (sum, value) => sum + (typeof value === 'string' ? new Blob([value]).size : 0),
          0
        );
        const validationError = uploadingCover
          ? 'Poczekaj na zakończenie wgrywania zdjęcia głównego.'
          : textSize > MAX_NEWS_TEXT_SIZE
            ? 'Treść formularza przekracza limit 1 MB.'
            : validateAttachmentSelection(files);
        setError(validationError);
        if (validationError) event.preventDefault();
      }}
    >
      <div className={styles.formGrid}>
        {children}
        <div className={styles.field}>
          <label htmlFor="attachments">Załączniki do pobrania</label>
          <input
            ref={input}
            id="attachments"
            name="attachments"
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            aria-describedby="attachments-help"
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              setFiles(selected);
              setError(validateAttachmentSelection(selected));
            }}
          />
          <span id="attachments-help" className={styles.helpText}>{ATTACHMENT_HELP}</span>
          {files.length > 0 && (
            <ul aria-label="Wybrane załączniki">
              {files.map((file, index) => <li key={index}>{file.name}</li>)}
            </ul>
          )}
        </div>
        {(error || state.error) && <p role="alert">{error || state.error}</p>}
        {state.success && !error && <p role="status">{state.success}</p>}
        <div>
          <SubmitButton pendingText="Wgrywanie załączników i zapisywanie...">
            {submitLabel}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
