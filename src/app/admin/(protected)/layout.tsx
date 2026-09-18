import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import SignOutButton from '@/components/admin/SignOutButton';
import styles from '@/components/admin/admin.module.scss';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session?.user) {
    redirect('/admin/sign-in');
  }

  return (
    <div className={styles.shell}>
      <div className={styles.topbar}>
        <div className={styles.topbarBrand}>
          Kroki ku Aktywności
          <span className={styles.topbarBadge}>Panel administracyjny</span>
        </div>
        <div className={styles.topbarActions}>
          <span>{session.user.email}</span>
          <SignOutButton />
        </div>
      </div>
      <div className={styles.body}>
        <AdminNav />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
