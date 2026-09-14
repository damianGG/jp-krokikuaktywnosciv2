import { getHomepageContent, updateHomepageContent } from '@/lib/actions/homepage';
import SubmitButton from '@/components/admin/SubmitButton';
import styles from '@/components/admin/admin.module.scss';

export const metadata = {
  title: 'Panel administracyjny - strona główna',
};

export const dynamic = 'force-dynamic';

export default async function AdminStronaGlownaPage() {
  const content = await getHomepageContent();

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Strona główna</h1>
        <p className={styles.pageSubtitle}>
          Edytuj nagłówek i zdjęcie w sekcji Hero oraz treść opisu projektu.
        </p>
      </div>

      <form action={updateHomepageContent} className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Sekcja Hero</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="heroTitle">Nagłówek</label>
            <input
              id="heroTitle"
              name="heroTitle"
              type="text"
              defaultValue={content.heroTitle}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="heroSubtitle">Okres realizacji</label>
            <input
              id="heroSubtitle"
              name="heroSubtitle"
              type="text"
              defaultValue={content.heroSubtitle}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="heroImage">Zdjęcie w tle</label>
            <input id="heroImage" name="heroImage" type="file" accept="image/*" />
            <span className={styles.helpText}>
              Zostaw puste, aby zachować obecne zdjęcie.
            </span>
            <div className={styles.imagePreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.heroImageUrl} alt="Aktualne zdjęcie hero" />
            </div>
          </div>
        </div>

        <div className={styles.cardHeader} style={{ marginTop: '1.75rem' }}>
          <span className={styles.cardTitle}>Opis projektu</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="aboutContent">Treść</label>
            <textarea
              id="aboutContent"
              name="aboutContent"
              rows={14}
              defaultValue={content.aboutContent}
            />
            <span className={styles.helpText}>
              Nową linię wstawiaj, aby rozdzielić akapity (puste linie tworzą odstępy).
            </span>
          </div>

          <div>
            <SubmitButton pendingText="Zapisywanie...">Zapisz zmiany</SubmitButton>
          </div>
        </div>
      </form>
    </>
  );
}
