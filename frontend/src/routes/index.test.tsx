import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  $api: {
    useQuery: (...args: ReadonlyArray<unknown>) => useQueryMock(...args),
  },
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
