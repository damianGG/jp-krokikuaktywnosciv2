import {
  getRekrutacjaContent,
  getRekrutacjaPliki,
  updateRekrutacjaContent,
  deleteRekrutacjaFile,
} from '@/lib/actions/rekrutacja';
import SubmitButton from '@/components/admin/SubmitButton';
import RekrutacjaUploadForm from '@/components/admin/RekrutacjaUploadForm';
import styles from '@/components/admin/admin.module.scss';

export const metadata = {
  title: 'Panel administracyjny - rekrutacja',
};

export const dynamic = 'force-dynamic';

export default async function AdminRekrutacjaPage() {
  const [content, files] = await Promise.all([
    getRekrutacjaContent(),
    getRekrutacjaPliki(),
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Rekrutacja</h1>
        <p className={styles.pageSubtitle}>
          Edytuj treść strony rekrutacji oraz zarządzaj dokumentami do pobrania.
        </p>
      </div>

      <form action={updateRekrutacjaContent} className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Treść strony</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Nagłówek</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={content?.title ?? ''}
              placeholder="Rekrutacja"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="intro">Wprowadzenie (pod nagłówkiem)</label>
            <input
              id="intro"
              name="intro"
              type="text"
              defaultValue={content?.intro ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Treść wprowadzająca</label>
            <textarea
              id="content"
              name="content"
              rows={10}
              defaultValue={content?.content ?? ''}
            />
            <span className={styles.helpText}>
              Nową linię odstępu użyj, aby rozdzielić akapity.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="eligibilityTitle">Nagłówek sekcji „Kto może wziąć udział”</label>
            <input
              id="eligibilityTitle"
              name="eligibilityTitle"
              type="text"
              defaultValue={content?.eligibilityTitle ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="eligibilityItems">Kryteria udziału</label>
            <textarea
              id="eligibilityItems"
              name="eligibilityItems"
              rows={8}
              defaultValue={content?.eligibilityItems ?? ''}
            />
            <span className={styles.helpText}>Wpisz każde kryterium w osobnym wierszu.</span>
          </div>

          <div className={styles.field}>
            <label htmlFor="priorityContent">Informacja o pierwszeństwie udziału</label>
            <textarea
              id="priorityContent"
              name="priorityContent"
              rows={5}
              defaultValue={content?.priorityContent ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="equalOpportunities">Informacja o równych szansach</label>
            <textarea
              id="equalOpportunities"
              name="equalOpportunities"
              rows={5}
              defaultValue={content?.equalOpportunities ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="applicationTitle">Nagłówek sekcji zgłoszenia</label>
            <input
              id="applicationTitle"
              name="applicationTitle"
              type="text"
              defaultValue={content?.applicationTitle ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="applicationIntro">Wprowadzenie do zgłoszenia</label>
            <textarea
              id="applicationIntro"
              name="applicationIntro"
              rows={5}
              defaultValue={content?.applicationIntro ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="applicationSteps">Kroki zgłoszenia</label>
            <textarea
              id="applicationSteps"
              name="applicationSteps"
              rows={8}
              defaultValue={content?.applicationSteps ?? ''}
            />
            <span className={styles.helpText}>Wpisz każdy krok w osobnym wierszu.</span>
          </div>

          <div className={styles.field}>
            <label htmlFor="applicationHelp">Dodatkowa pomoc przy zgłoszeniu</label>
            <textarea
              id="applicationHelp"
              name="applicationHelp"
              rows={5}
              defaultValue={content?.applicationHelp ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="documentsTitle">Nagłówek sekcji dokumentów</label>
            <input
              id="documentsTitle"
              name="documentsTitle"
              type="text"
              defaultValue={content?.documentsTitle ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="documentsIntro">Wprowadzenie do dokumentów</label>
            <textarea
              id="documentsIntro"
              name="documentsIntro"
              rows={5}
              defaultValue={content?.documentsIntro ?? ''}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="documentsFooter">Informacja pod dokumentami</label>
            <textarea
              id="documentsFooter"
              name="documentsFooter"
              rows={5}
              defaultValue={content?.documentsFooter ?? ''}
            />
          </div>

          <div>
            <SubmitButton pendingText="Zapisywanie...">Zapisz treść</SubmitButton>
          </div>
        </div>
      </form>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Dokumenty do pobrania</span>
        </div>

        {files.length === 0 ? (
          <p className={styles.emptyState}>Brak dokumentów. Dodaj pierwszy plik.</p>
        ) : (
          <div className={styles.list}>
            {files.map((file) => {
              const deleteFile = deleteRekrutacjaFile.bind(null, file.id);
              return (
                <div className={styles.listItem} key={file.id}>
                  <div className={styles.listItemMain}>
                    <div className={styles.listItemTitle}>
                      {file.description || file.name}
                    </div>
                    <div className={styles.listItemMeta}>{file.name}</div>
                    {file.blackWhiteUrl && (
                      <div className={styles.listItemMeta}>Wersja czarno-biała dodana</div>
                    )}
                  </div>
                  <div className={styles.listItemActions}>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                    >
                      Kolor
                    </a>
                    {file.blackWhiteUrl && (
                      <a
                        href={file.blackWhiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                      >
                        Czarno-biały
                      </a>
                    )}
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

        <RekrutacjaUploadForm />
      </div>
    </>
  );
}
