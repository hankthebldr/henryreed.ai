'use client'

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { AuthProvider } from '../contexts/AuthContext'
import { AppStateProvider } from '../contexts/AppStateContext'

interface ProvidersProps {
  children: React.ReactNode
}

// Create a custom system for Chakra UI v3
const system = createSystem(defaultConfig, {
  globalCss: {},
  theme: {
    tokens: {
      colors: {
        cortex: {
          50: { value: '#FFF8F5' },
          500: { value: '#FF6900' },
          600: { value: '#E55A00' },
        },
        success: {
          400: { value: '#33D580' },
          500: { value: '#00CC66' },
        },
        warning: {
          400: { value: '#FBBF24' },
          500: { value: '#F59E0B' },
        },
        error: {
          400: { value: '#F87171' },
          500: { value: '#F85149' },
        },
        info: {
          400: { value: '#60A5FA' },
          500: { value: '#58A6FF' },
        }
      }
    }
  }
})

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}

// Helper component for checking if UI v2 is enabled
export function useUIVersion() {
  const isV2Enabled = process.env.NEXT_PUBLIC_UI_V2 === 'true'
  return { isV2Enabled }
}

// Feature flag hook for conditional rendering
export function UIVersionGate({ 
  v1Component, 
  v2Component 
}: { 
  v1Component: React.ReactNode
  v2Component: React.ReactNode 
}) {
  const { isV2Enabled } = useUIVersion()
  return <>{isV2Enabled ? v2Component : v1Component}</>
}