'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import styles from './admin.module.scss';

type Props = {
  slug?: string;
};

export default function AktualnoscCoverImageInput({ slug = 'aktualnosc' }: Props) {
  const [url, setUrl] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);

    try {
      const blob = await upload(`aktualnosci/${slug}-${file.name}`, file, {
        access: 'private',
        handleUploadUrl: '/api/rekrutacja/upload',
      });
      setUrl(blob.url);
    } catch (error) {
      event.target.value = '';
      setUrl('');
      setError(error instanceof Error ? error.message : 'Nie udało się wgrać zdjęcia.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <input type="hidden" name="coverImageUrl" value={url} />
      <input
        id="coverImage"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={pending}
      />
      {pending && <span className={styles.helpText}>Wgrywanie zdjęcia...</span>}
      {error && (
        <p className={styles.helpText} style={{ color: '#c0392b' }} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
