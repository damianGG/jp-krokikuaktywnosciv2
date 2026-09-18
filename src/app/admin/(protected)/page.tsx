import Link from 'next/link';
import { db } from '@/lib/db';
import { aktualnosci, rekrutacjaPliki, oProjekcieBloki } from '@/lib/db/schema';
import styles from '@/components/admin/admin.module.scss';

export const metadata = {
  title: 'Panel administracyjny - przegląd',
};

export default async function AdminHomePage() {
  const [newsCount, filesCount, blokiCount] = await Promise.all([
    db.$count(aktualnosci),
    db.$count(rekrutacjaPliki),
    db.$count(oProjekcieBloki),
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Przegląd</h1>
        <p className={styles.pageSubtitle}>
          Zarządzaj treścią strony Kroki ku Aktywności.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>O projekcie</span>
          <Link href="/admin/o-projekcie" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            Zarządzaj
          </Link>
        </div>
        <p className={styles.pageSubtitle}>
          Edytuj opis projektu, efekty oraz formy wsparcia.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Aktualności</span>
          <Link href="/admin/aktualnosci" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            Zarządzaj
          </Link>
        </div>
        <p className={styles.pageSubtitle}>
          Opublikowanych i szkicowych wpisów: <strong>{newsCount}</strong>
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Rekrutacja</span>
          <Link href="/admin/rekrutacja" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            Zarządzaj
          </Link>
        </div>
        <p className={styles.pageSubtitle}>
          Plików do pobrania: <strong>{filesCount}</strong>
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Strona główna</span>
          <Link href="/admin/strona-glowna" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            Zarządzaj
          </Link>
        </div>
        <p className={styles.pageSubtitle}>
          Edytuj sekcję hero i opis projektu na stronie głównej.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>O projekcie</span>
          <Link href="/admin/o-projekcie" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            Zarządzaj
          </Link>
        </div>
        <p className={styles.pageSubtitle}>
          Form wsparcia na stronie: <strong>{blokiCount}</strong>
        </p>
      </div>
    </>
  );
}
