'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { saveRekrutacjaFile } from '@/lib/actions/rekrutacja';
import styles from './admin.module.scss';

export default function RekrutacjaUploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const description = String(formData.get('description') ?? '').trim();
    const colorFile = formData.get('colorFile') as File | null;
    const blackWhiteFile = formData.get('blackWhiteFile') as File | null;

    if (!colorFile || colorFile.size === 0) {
      setError('Wybierz plik kolorowy do wgrania.');
      return;
    }

    setPending(true);

    // Client uploads can hang silently (e.g. a stuck network request) with
    // no rejection ever firing. This timeout guarantees the button always
    // recovers and surfaces an actionable error instead of spinning forever.
    const withTimeout = <T,>(promise: Promise<T>, label: string, ms = 30000): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Przekroczono limit czasu (${label}). Sprawdź połączenie i spróbuj ponownie.`)),
            ms,
          ),
        ),
      ]);

    try {
      console.log('[v0] rekrutacja upload: start', {
        colorFile: colorFile.name,
        size: colorFile.size,
      });

      const colorBlob = await withTimeout(
        upload(`rekrutacja/kolor/${colorFile.name}`, colorFile, {
          access: 'public',
          handleUploadUrl: '/api/rekrutacja/upload',
        }),
        'wgrywanie pliku kolorowego',
      );
      console.log('[v0] rekrutacja upload: color blob done', colorBlob.url);

      let blackWhite: { url: string; pathname: string } | null = null;
      if (blackWhiteFile && blackWhiteFile.size > 0) {
        const bwBlob = await withTimeout(
          upload(`rekrutacja/czarno-biale/${blackWhiteFile.name}`, blackWhiteFile, {
            access: 'public',
            handleUploadUrl: '/api/rekrutacja/upload',
          }),
          'wgrywanie pliku czarno-białego',
        );
        console.log('[v0] rekrutacja upload: bw blob done', bwBlob.url);
        blackWhite = { url: bwBlob.url, pathname: bwBlob.pathname };
      }

      console.log('[v0] rekrutacja upload: saving to db');
      await withTimeout(
        saveRekrutacjaFile({
          description,
          name: colorFile.name,
          url: colorBlob.url,
          pathname: colorBlob.pathname,
          blackWhiteUrl: blackWhite?.url ?? null,
          blackWhitePathname: blackWhite?.pathname ?? null,
        }),
        'zapis do bazy danych',
      );
      console.log('[v0] rekrutacja upload: saved, refreshing');

      form.reset();
      router.refresh();
    } catch (err) {
      console.error('[v0] rekrutacja upload: failed', err);
      setError(
        err instanceof Error ? err.message : 'Nie udało się wgrać pliku. Spróbuj ponownie.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="description">Nazwa widoczna dla odwiedzających</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="np. Regulamin rekrutacji"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="colorFile">Plik kolorowy</label>
          <input id="colorFile" name="colorFile" type="file" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="blackWhiteFile">Plik czarno-biały</label>
          <input id="blackWhiteFile" name="blackWhiteFile" type="file" />
        </div>
      </div>

      {error && (
        <p className={styles.helpText} style={{ color: '#c0392b' }} role="alert">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          {pending ? 'Wgrywanie...' : 'Dodaj plik'}
        </button>
      </div>
    </form>
  );
}
