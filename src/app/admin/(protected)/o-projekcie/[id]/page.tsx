import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getOProjekcieBlok,
  updateOProjekcieBlok,
  deleteOProjekcieBlok,
} from '@/lib/actions/o-projekcie';
import SubmitButton from '@/components/admin/SubmitButton';
import RichTextEditor from '@/components/admin/RichTextEditor';
import styles from '@/components/admin/admin.module.scss';
import { blobProxyUrl } from '@/lib/blob-proxy';

export const metadata = {
  title: 'Panel administracyjny - edycja bloku',
};

export const dynamic = 'force-dynamic';

export default async function EditOProjekcieBlokPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const blok = await getOProjekcieBlok(id);

  if (!blok) {
    notFound();
  }

  const updateWithId = updateOProjekcieBlok.bind(null, id);
  const deleteWithId = deleteOProjekcieBlok.bind(null, id);

  return (
    <>
      <Link href="/admin/o-projekcie" className={styles.backLink}>
        ← Wróć do listy
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edytuj formę wsparcia</h1>
        <p className={styles.pageSubtitle}>{blok.title}</p>
      </div>

      <form action={updateWithId} className={styles.card}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Tytuł</label>
            <input id="title" name="title" type="text" defaultValue={blok.title} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Opis</label>
            <RichTextEditor name="content" defaultValue={blok.content} />
            <span className={styles.helpText}>
              Najlepiej użyj listy punktowanej — punkty wyświetlą się ze znacznikami na stronie.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="image">Zdjęcie</label>
            {blok.imageUrl && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blobProxyUrl(blok.imageUrl) ?? blok.imageUrl} alt={blok.title} />
                <span className={styles.helpText}>Wgraj nowy plik, aby je zastąpić.</span>
              </div>
            )}
            <input id="image" name="image" type="file" accept="image/*" />
          </div>

          <div>
            <SubmitButton pendingText="Zapisywanie...">Zapisz zmiany</SubmitButton>
          </div>
        </div>
      </form>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Usuń blok</span>
        </div>
        <p className={styles.helpText} style={{ marginBottom: '1rem' }}>
          Tej operacji nie można odwrócić. Blok zniknie ze strony „O projekcie”.
        </p>
        <form action={deleteWithId}>
          <SubmitButton variant="danger" pendingText="Usuwanie...">
            Usuń blok
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
