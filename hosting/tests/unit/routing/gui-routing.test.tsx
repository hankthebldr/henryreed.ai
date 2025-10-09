import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import GUIPage from '../../../app/gui/page';

jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div data-testid="cortex-gui-interface" />;
  return MockComponent;
});

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const useAuth = require('../../../contexts/AuthContext').useAuth as jest.Mock;
const useRouter = require('next/navigation').useRouter as jest.Mock;

describe('GUIPage routing', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push });
  });

  it('shows a loading state while authentication is resolving', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<GUIPage />);

    expect(screen.getByText(/verifying your credentials/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to the login page', async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<GUIPage />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/');
    });
  });

  it('renders the Cortex GUI when the user is authenticated', () => {
    useAuth.mockReturnValue({
      user: { uid: '123', email: 'demo@example.com' },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<GUIPage />);

    expect(screen.getByTestId('cortex-gui-interface')).toBeInTheDocument();
  });
});
