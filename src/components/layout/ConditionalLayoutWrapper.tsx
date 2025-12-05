'use client';

import { usePathname } from 'next/navigation';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import styles from '../../app/layout.module.css';

export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    // For dashboard routes, we don't want the public navbar or footer.
    // The dashboard has its own layout.
    return <>{children}</>;
  }

  // For all other public routes, wrap with the main site's layout
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
