import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  getAktualnoscById,
  updateAktualnosc,
  deleteAktualnosc,
  deleteAktualnoscFile,
} from '@/lib/actions/aktualnosci';
import SubmitButton from '@/components/admin/SubmitButton';
import AktualnoscForm from '@/components/admin/AktualnoscForm';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AktualnoscCoverImageInput from '@/components/admin/AktualnoscCoverImageInput';
import styles from '@/components/admin/admin.module.scss';
import { blobProxyUrl } from '@/lib/blob-proxy';

export const metadata = {
  title: 'Panel administracyjny - edycja aktualności',
};

export const dynamic = 'force-dynamic';

export default async function EditAktualnoscPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const article = await getAktualnoscById(id);

  if (!article) {
    notFound();
  }

  const updateWithId = updateAktualnosc.bind(null, id);
  const deleteWithId = deleteAktualnosc.bind(null, id);

  return (
    <>
      <Link href="/admin/aktualnosci" className={styles.backLink}>
        ← Wróć do listy
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edytuj aktualność</h1>
        <p className={styles.pageSubtitle}>{article.title}</p>
      </div>

      <AktualnoscForm action={updateWithId} submitLabel="Zapisz zmiany">
          <div className={styles.field}>
            <label htmlFor="title">Tytuł</label>
            <input id="title" name="title" type="text" defaultValue={article.title} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="excerpt">Krótki opis (widoczny na liście)</label>
            <input
              id="excerpt"
              name="excerpt"
              type="text"
              maxLength={200}
              defaultValue={article.excerpt ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="publicationDate">Data publikacji</label>
            <input
              id="publicationDate"
              name="publicationDate"
              type="date"
              defaultValue={format(article.createdAt, 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Treść</label>
            <RichTextEditor name="content" defaultValue={article.content} />
            <span className={styles.helpText}>
              Użyj paska narzędzi, aby pogrubić tekst, dodać kursywę, nagłówki lub listy.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="coverImage">Zdjęcie główne</label>
            {article.coverImageUrl && (
              <div className={styles.imagePreview}>
                <img
                  src={blobProxyUrl(article.coverImageUrl) ?? article.coverImageUrl}
                  alt={article.title}
                />
                <span className={styles.helpText}>Wgraj nowy plik, aby je zastąpić.</span>
              </div>
            )}
            <AktualnoscCoverImageInput slug={article.slug} />
          </div>

          <div className={styles.checkboxRow}>
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={article.published}
            />
            <label htmlFor="published">Opublikowane</label>
          </div>

      </AktualnoscForm>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Pliki do pobrania</span>
        </div>

        {article.files.length === 0 ? (
          <p className={styles.emptyState}>Brak plików w tym wpisie.</p>
        ) : (
          <div className={styles.list}>
            {article.files.map((file) => {
              const deleteFile = deleteAktualnoscFile.bind(null, file.id, id);
              return (
                <div className={styles.listItem} key={file.id}>
                  <div className={styles.listItemMain}>
                    <div className={styles.listItemTitle}>{file.name}</div>
                  </div>
                  <div className={styles.listItemActions}>
                    <a
                      href={blobProxyUrl(file.url, { download: true, filename: file.name }) ?? file.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                      aria-label={`Pobierz ${file.name}`}
                    >
                      Pobierz
                    </a>
                    <form action={deleteFile}>
                      <SubmitButton variant="danger" size="sm" pendingText="Usuwanie...">
                        Usuń
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Usuń aktualność</span>
        </div>
        <p className={styles.helpText} style={{ marginBottom: '1rem' }}>
          Tej operacji nie można odwrócić. Wpis i jego pliki zostaną usunięte na stałe.
        </p>
        <form action={deleteWithId}>
          <SubmitButton variant="danger" pendingText="Usuwanie...">
            Usuń aktualność
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
