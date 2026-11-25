import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorPage, RootErrorPage } from './ErrorPage.js';

const renderApp = ({
  failRoot = () => false,
  failPage = () => false,
}: {
  readonly failRoot?: () => boolean;
  readonly failPage?: () => boolean;
}) => {
  const rootRoute = createRootRoute({
    component: () => {
      if (failRoot()) throw new Error('root exploded');
      return (
        <div>
          <p>Layout</p>
          <Outlet />
        </div>
      );
    },
    errorComponent: RootErrorPage,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => {
      if (failPage()) throw new Error('page exploded');
      return <p>Page content</p>;
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultErrorComponent: ErrorPage,
  });
  return render(<RouterProvider router={router} />);
};

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a page error inside the root layout', async () => {
    renderApp({ failPage: () => true });

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('page exploded')).toBeInTheDocument();
  });

  it('replaces the whole app when the root layout fails', async () => {
    renderApp({ failRoot: () => true });

    expect(await screen.findByRole('alert')).toHaveTextContent('root exploded');
    expect(screen.queryByText('Layout')).not.toBeInTheDocument();
  });

  it('recovers when Try again succeeds', async () => {
    let shouldFail = true;
    renderApp({ failPage: () => shouldFail });
    await screen.findByRole('alert');

    shouldFail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Page content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('links back to the start', async () => {
    renderApp({ failPage: () => true });

    expect(await screen.findByRole('link', { name: 'Go to start' })).toHaveAttribute('href', '/');
  });
});
