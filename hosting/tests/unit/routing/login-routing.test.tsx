import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { LoginPage } from '../../../app/page';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const useAuth = require('../../../contexts/AuthContext').useAuth as jest.Mock;
const useRouter = require('next/navigation').useRouter as jest.Mock;

describe('LoginPage routing', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });
  });

  it('redirects authenticated users to the GUI dashboard', async () => {
    useAuth.mockReturnValue({
      user: { uid: '123', email: 'demo@example.com' },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/gui');
    });
  });

  it('invokes signIn with the provided credentials', async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn,
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'demo' } });
    fireEvent.click(screen.getByRole('button', { name: /access dc portal/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('demo', 'demo');
    });
  });

  it('shows authentication errors returned from signIn', async () => {
    const signIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn,
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /access dc portal/i }));

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('renders the loading state while authentication status is resolving', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      isMockMode: true,
    });

    render(<LoginPage />);

    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    expect(screen.getByText(/verifying your credentials/i)).toBeInTheDocument();
  });
});
