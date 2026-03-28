import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';


jest.mock('next-auth/react');
jest.mock('swr');
jest.mock('@/lib/api', () => ({
  api: {
    put: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('@/components/AuthButtons', () => ({
  SignOutButton: () => <button>Logout</button>,
}));

describe('Dashboard Inline Edit Flow', () => {
  const mockMutateProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });

    (useSWR as jest.Mock).mockImplementation((key) => {
      if (key === '/api/me') {
        return {
          data: { favoriteMovie: 'The Matrix' },
          mutate: mockMutateProfile,
          error: undefined,
        };
      }
      return {
        data: { fact: 'A cool fact about The Matrix.' },
        mutate: jest.fn(),
        isValidating: false,
        error: undefined,
      };
    });
  });

  it('allows the user to edit and save their favorite movie', async () => {
    (api.put as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<Dashboard />);

    expect(screen.getByText('The Matrix')).toBeInTheDocument();

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue('The Matrix');
    fireEvent.change(input, { target: { value: 'Inception' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/me/movie', { movie: 'Inception' });
    });

    expect(mockMutateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ favoriteMovie: 'Inception' }),
      false
    );
  });
});