import Link from 'next/link';
import { format } from 'date-fns';
import { createAktualnosc } from '@/lib/actions/aktualnosci';
import AktualnoscForm from '@/components/admin/AktualnoscForm';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AktualnoscCoverImageInput from '@/components/admin/AktualnoscCoverImageInput';
import styles from '@/components/admin/admin.module.scss';

export const metadata = {
  title: 'Panel administracyjny - nowa aktualność',
};

export default function NewAktualnoscPage() {
  return (
    <>
      <Link href="/admin/aktualnosci" className={styles.backLink}>
        ← Wróć do listy
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Nowa aktualność</h1>
        <p className={styles.pageSubtitle}>
          Wypełnij treść wpisu i wybierz pliki do pobrania. Wszystko zapiszesz razem.
        </p>
      </div>

      <AktualnoscForm action={createAktualnosc} submitLabel="Zapisz aktualność">
          <div className={styles.field}>
            <label htmlFor="title">Tytuł</label>
            <input id="title" name="title" type="text" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="excerpt">Krótki opis (widoczny na liście)</label>
            <input id="excerpt" name="excerpt" type="text" maxLength={200} />
          </div>

          <div className={styles.field}>
            <label htmlFor="publicationDate">Data publikacji</label>
            <input
              id="publicationDate"
              name="publicationDate"
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Treść</label>
            <RichTextEditor name="content" />
            <span className={styles.helpText}>
              Użyj paska narzędzi, aby pogrubić tekst, dodać kursywę, nagłówki lub listy.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="coverImage">Zdjęcie główne</label>
            <AktualnoscCoverImageInput />
          </div>

          <div className={styles.checkboxRow}>
            <input id="published" name="published" type="checkbox" defaultChecked />
            <label htmlFor="published">Opublikuj od razu</label>
          </div>

      </AktualnoscForm>
    </>
  );
}
