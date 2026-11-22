import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  $api: {
    useQuery: (...args: ReadonlyArray<unknown>) => useQueryMock(...args),
  },
}));

// --human
// Avoid constructing a real `@supabase/supabase-js` client in unit tests: it requires env vars
// that `.env.local` deliberately doesn't supply in Vitest's `test` mode, and a real client would
// make network calls (`getSession`, `onAuthStateChange`) during render.
vi.mock('@/lib/supabase/useAuth', () => ({
  useAuth: () => ({ session: null, loading: false }),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}));

const { IndexPage } = await import('./index.js');

describe('IndexPage', () => {
  it('renders the greeting returned by the API', () => {
    useQueryMock.mockReturnValue({
      isPending: false,
      isFetching: false,
      isError: false,
      data: { message: 'Hello, World!' },
      error: undefined,
      refetch: vi.fn(),
    });

    render(<IndexPage />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('renders a loading state while the query is pending', () => {
    useQueryMock.mockReturnValue({
      isPending: true,
      isFetching: true,
      isError: false,
      data: undefined,
      error: undefined,
      refetch: vi.fn(),
    });

    render(<IndexPage />);

    expect(screen.getByText('Loading greeting…')).toBeInTheDocument();
  });
});
