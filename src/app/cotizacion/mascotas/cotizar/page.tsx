import { Suspense } from 'react';
import ClientPage from './ClientPage';
import CotizacionSkeleton from '@/components/ui/CotizacionSkeleton';

export const dynamic = 'force-dynamic';

export default function CotizarMascotaPage() {
  return (
    <Suspense fallback={<CotizacionSkeleton />}>
      <ClientPage />
    </Suspense>
  );
}