'use client';

import dynamic from 'next/dynamic';

import { Loading } from '../../components/ui';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const ProductionTRRManagement = dynamic(
  () =>
    import('../../components/ProductionTRRManagement').then(mod => ({
      default: mod.ProductionTRRManagement,
    })),
  {
    ssr: false,
    loading: () => (
      <Loading size="lg" text="Loading TRR management workspace..." fullscreen />
    ),
  },
);

export function TRRClient() {
  const { isAuthenticated } = useAuthGuard();

  if (isAuthenticated === null) {
    return <Loading size="lg" text="Initializing TRR management experience..." fullscreen />;
  }

  if (isAuthenticated) {
    return <ProductionTRRManagement />;
  }

  return null;
}
