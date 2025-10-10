import { Suspense } from 'react';

import { Loading } from '../../components/ui';

import { TRRClient } from './TRRClient';

export default function TRRPage() {
  return (
    <Suspense
      fallback={
        <Loading
          size="lg"
          text="Initializing TRR management experience..."
          fullscreen
        />
      }
    >
      <TRRClient />
    </Suspense>
  );
}
