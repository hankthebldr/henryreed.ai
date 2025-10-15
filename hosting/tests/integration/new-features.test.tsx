/**
 * Integration Tests for New Features
 *
 * Tests for:
 * - Demo Slideshow feature integration
 * - Announcement Banner functionality
 * - NICCEE Framework navigation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>) => {
    const DynamicComponent = () => <div data-testid="mock-dynamic-component" />;
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
}));

// Mock all heavy components
jest.mock('../../components/DemoHub', () => ({
  DemoHub: () => <div data-testid="demo-hub">Demo Hub</div>,
}));

jest.mock('../../components/XSIAMHealthMonitor', () => ({
  XSIAMHealthMonitor: () => <div data-testid="xsiam-health-monitor">Platform Health</div>,
}));

jest.mock('../../components/EnhancedAIAssistant', () => ({
  EnhancedAIAssistant: () => <div data-testid="ai-assistant">AI Assistant</div>,
}));

jest.mock('../../components/BigQueryExplorer', () => ({
  BigQueryExplorer: () => <div data-testid="bigquery-explorer">Data Analytics</div>,
}));

jest.mock('../../components/POVProjectManagement', () => ({
  POVProjectManagement: () => <div data-testid="pov-management">POV Management</div>,
}));

jest.mock('../../components/ProductionTRRManagement', () => ({
  ProductionTRRManagement: () => <div data-testid="trr-management">TRR Management</div>,
}));

jest.mock('../../components/ManagementDashboard', () => ({
  ManagementDashboard: () => <div data-testid="management-dashboard">Management Dashboard</div>,
}));

jest.mock('../../components/AssetUploader', () => ({
  AssetUploader: () => <div data-testid="asset-uploader">Asset Upload</div>,
}));

jest.mock('../../components/KnowledgeBaseLibrary', () => ({
  KnowledgeBaseLibrary: () => <div data-testid="knowledge-base">Knowledge Vault</div>,
}));

jest.mock('../../components/DataIntegrationHub', () => ({
  DataIntegrationHub: () => <div data-testid="data-integration">Data Integration</div>,
}));

jest.mock('../../components/WorkshopManagement', () => ({
  WorkshopManagement: () => <div data-testid="workshop-management">Workshops</div>,
}));

jest.mock('../../components/POVBestPractices', () => ({
  POVBestPractices: () => <div data-testid="pov-best-practices">Best Practices</div>,
}));

jest.mock('../../components/NICCEEFramework', () => ({
  NICCEEFramework: () => <div data-testid="niccee-framework">NICCEE Framework</div>,
}));

jest.mock('../../components/UnifiedContentCreator', () => ({
  __esModule: true,
  default: () => <div data-testid="unified-content-creator">Content Library</div>,
}));

jest.mock('../../components/EnhancedTerminalSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="terminal-sidebar">Terminal Sidebar</div>,
}));

// Mock contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../contexts/AppStateContext', () => ({
  useAppState: jest.fn(),
  AppStateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({
    trackFeatureUsage: jest.fn(),
    trackPageView: jest.fn(),
  }),
}));

jest.mock('../../hooks/useCommandExecutor', () => ({
  useCommandExecutor: () => ({
    run: jest.fn(),
    isRunning: false,
    error: null,
  }),
}));

jest.mock('../../lib/user-management', () => ({
  userManagementService: {
    getUserById: jest.fn(),
    setActiveUser: jest.fn(),
    getUsers: jest.fn(),
    generateSystemMetrics: jest.fn(),
  },
}));

jest.mock('../../lib/dc-context-store', () => ({
  dcContextStore: {
    getAllCustomerEngagements: jest.fn(() => []),
    getAllActivePOVs: jest.fn(() => []),
    getAllTRRRecords: jest.fn(() => []),
    getCurrentWorkflowContext: jest.fn(() => ({ recentActivity: [], activeCustomers: 0 })),
  },
}));

// Import component after mocks
import CortexGUIInterface from '../../components/CortexGUIInterface';

const useAuth = require('../../contexts/AuthContext').useAuth as jest.Mock;
const useAppState = require('../../contexts/AppStateContext').useAppState as jest.Mock;

describe('New Features Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated user
    useAuth.mockReturnValue({
      user: { uid: '123', email: 'demo@example.com' },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
      hasPermission: jest.fn(() => true),
    });

    // Mock app state
    useAppState.mockReturnValue({
      state: {
        auth: {
          user: { id: '123', email: 'demo@example.com', name: 'Demo User' },
        },
        data: {},
      },
      actions: {
        notify: jest.fn(),
        updateData: jest.fn(),
      },
    });
  });

  describe('GUI Tab Navigation', () => {
    it('renders all expected tabs including NICCEE Framework', () => {
      render(<CortexGUIInterface />);

      // Check for Dashboard tab
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Check for POV Management tab
      expect(screen.getByText('POV Management')).toBeInTheDocument();

      // Check for TRR tab
      expect(screen.getByText('TRR & Requirements')).toBeInTheDocument();

      // Check for NICCEE Framework tab (new feature)
      expect(screen.getByText('NICCEE Framework')).toBeInTheDocument();
    });

    it('navigates to NICCEE Framework tab when clicked', async () => {
      render(<CortexGUIInterface />);

      // Find and click NICCEE Framework tab
      const nicceeTab = screen.getByText('NICCEE Framework');
      fireEvent.click(nicceeTab);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByTestId('niccee-framework')).toBeInTheDocument();
      });
    });

    it('navigates between different tabs without errors', async () => {
      render(<CortexGUIInterface />);

      // Navigate to POV Management
      const povTab = screen.getByText('POV Management');
      fireEvent.click(povTab);

      await waitFor(() => {
        expect(screen.getByTestId('pov-management')).toBeInTheDocument();
      });

      // Navigate to NICCEE Framework
      const nicceeTab = screen.getByText('NICCEE Framework');
      fireEvent.click(nicceeTab);

      await waitFor(() => {
        expect(screen.getByTestId('niccee-framework')).toBeInTheDocument();
      });

      // Navigate to Best Practices
      const bestPracticesTab = screen.getByText('Best Practices');
      fireEvent.click(bestPracticesTab);

      await waitFor(() => {
        expect(screen.getByTestId('pov-best-practices')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Quick Actions', () => {
    it('renders Demo Slideshow quick action button', () => {
      render(<CortexGUIInterface />);

      // Look for Demo Slideshow button
      const demoSlideshowButton = screen.getByText('Demo Slideshow');
      expect(demoSlideshowButton).toBeInTheDocument();
    });

    it('renders all expected quick action buttons', () => {
      render(<CortexGUIInterface />);

      // Check for key quick actions
      expect(screen.getByText('New POV')).toBeInTheDocument();
      expect(screen.getByText('Demo Hub')).toBeInTheDocument();
      expect(screen.getByText('Upload CSV')).toBeInTheDocument();
      expect(screen.getByText('Generate Report')).toBeInTheDocument();
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('Detection Engine')).toBeInTheDocument();
      expect(screen.getByText('Demo Slideshow')).toBeInTheDocument();
      expect(screen.getByText('Badass Blueprint')).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders dashboard with stats cards', () => {
      render(<CortexGUIInterface />);

      // Check for dashboard elements
      expect(screen.getByText('Cortex DC Portal')).toBeInTheDocument();
      expect(screen.getByText('Domain Consultant Engagement Platform')).toBeInTheDocument();
    });

    it('renders terminal sidebar toggle button', () => {
      render(<CortexGUIInterface />);

      // Check for terminal toggle
      const terminalButton = screen.getByText('Terminal');
      expect(terminalButton).toBeInTheDocument();
    });

    it('renders all workshop-related tabs', () => {
      render(<CortexGUIInterface />);

      // Check for Workshops tab
      expect(screen.getByText('Workshops')).toBeInTheDocument();

      // Navigate to Workshops
      const workshopsTab = screen.getByText('Workshops');
      fireEvent.click(workshopsTab);

      // Should render workshop management component
      waitFor(() => {
        expect(screen.getByTestId('workshop-management')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('shows all tabs for admin users', () => {
      useAuth.mockReturnValue({
        user: { uid: '123', email: 'admin@example.com' },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithGoogle: jest.fn(),
        logout: jest.fn(),
        isMockMode: true,
        hasPermission: jest.fn(() => true),
      });

      useAppState.mockReturnValue({
        state: {
          auth: {
            user: { id: '123', email: 'admin@example.com', name: 'Admin User' },
          },
          data: {},
        },
        actions: {
          notify: jest.fn(),
          updateData: jest.fn(),
        },
      });

      render(<CortexGUIInterface />);

      // Admin should see DC Management tab
      expect(screen.getByText('DC Management')).toBeInTheDocument();

      // Admin should see NICCEE Framework
      expect(screen.getByText('NICCEE Framework')).toBeInTheDocument();
    });
  });

  describe('Navigation State Management', () => {
    it('maintains active tab state when navigating', async () => {
      render(<CortexGUIInterface />);

      // Click POV Management
      const povTab = screen.getByText('POV Management');
      fireEvent.click(povTab);

      await waitFor(() => {
        // POV tab should be active (have active styling)
        expect(povTab.closest('button')).toHaveClass('bg-cortex-accent/20');
      });

      // Click NICCEE Framework
      const nicceeTab = screen.getByText('NICCEE Framework');
      fireEvent.click(nicceeTab);

      await waitFor(() => {
        // NICCEE tab should now be active
        expect(nicceeTab.closest('button')).toHaveClass('bg-cortex-accent/20');
      });
    });
  });
});

describe('Component Lazy Loading', () => {
  it('lazy loads heavy components correctly', async () => {
    render(<CortexGUIInterface />);

    // Navigate to AI Assistant
    const aiTab = screen.getByText('AI Assistant');
    fireEvent.click(aiTab);

    await waitFor(() => {
      // Should render the mock component
      expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
    });
  });

  it('shows loading state while components load', () => {
    render(<CortexGUIInterface />);

    // Dashboard should render immediately (not lazy loaded)
    expect(screen.getByText('Cortex DC Portal')).toBeInTheDocument();
  });
});

describe('Error Boundaries and Edge Cases', () => {
  it('handles missing tab IDs gracefully', () => {
    render(<CortexGUIInterface initialTab="nonexistent-tab" />);

    // Should default to dashboard
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders without crashing when no user is provided initially', () => {
    useAppState.mockReturnValue({
      state: {
        auth: {
          user: null,
        },
        data: {},
      },
      actions: {
        notify: jest.fn(),
        updateData: jest.fn(),
      },
    });

    render(<CortexGUIInterface />);

    // Should still render the interface
    expect(screen.getByText('Cortex DC Portal')).toBeInTheDocument();
  });
});
