import styles from './DashboardLayout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardContainer}>
      <main className={styles.dashboardContent}>
        {children}
      </main>
    </div>
  );
}
