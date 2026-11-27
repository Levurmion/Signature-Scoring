import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { routeTree } from '@/routeTree.gen';

// --agent
// `openapi-fetch` captures `fetch` when the API client module loads, so the stub must exist before
// any import runs. Each test sets how the fake API answers through `api`.
const { api, requests } = vi.hoisted(() => {
  const fakeApi = {
    signUpStatus: 201,
    signUpBody: {} as unknown,
  };
  const seen: Array<{ readonly path: string; readonly body: unknown }> = [];
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- vi.hoisted runs before module scope exists
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  // Node's `Request` (unlike a browser's) cannot resolve the client's relative `/api/...` URLs.
  const NodeRequest = globalThis.Request;
  globalThis.Request = class extends NodeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(typeof input === 'string' ? new URL(input, 'http://localhost') : input, init);
    }
  };

  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const path = new URL(request.url).pathname;
    return request.text().then((text) => {
      seen.push({ path, body: text ? JSON.parse(text) : undefined });
      switch (path) {
        case '/api/auth/session':
        case '/api/users/redirect':
          return json(401, { _tag: 'UnauthorizedError', message: 'No session' });
        case '/api/auth/sign-up':
          return json(fakeApi.signUpStatus, fakeApi.signUpBody);
        default:
          return json(200, { status: 'ok' });
      }
    });
  };
  return { api: fakeApi, requests: seen };
});

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(() => {
  requests.length = 0;
  api.signUpStatus = 201;
  api.signUpBody = {};
});

const renderAt = (url: string) => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
    context: { queryClient: new QueryClient() },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
};

const fillProfileAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Age'), '36');
  await user.type(screen.getByLabelText('Highest Level of Education'), 'master');
  await user.click(await screen.findByRole('option', { name: "Master's degree (or equivalent)" }));
  await user.type(screen.getByLabelText('First language'), 'Engl');
  await user.click(await screen.findByRole('option', { name: 'English' }));
  await user.click(screen.getByLabelText('Fluency'));
  await user.click(await screen.findByRole('option', { name: 'Native/Bilingual' }));
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
};

describe('/sign-up', () => {
  it('asks for email and password above the profile fields when provider=email', async () => {
    renderAt('/sign-up?provider=email');

    const email = await screen.findByLabelText('Email');
    const name = screen.getByLabelText('Name');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(email.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows a 409 from the API on the email field', async () => {
    const user = userEvent.setup();
    api.signUpStatus = 409;
    api.signUpBody = { _tag: 'ConflictError' };
    renderAt('/sign-up?provider=email');

    await user.type(await screen.findByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct horse');
    await fillProfileAndSubmit(user);

    expect(await screen.findByText('An account with this email already exists.')).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(requests.find((r) => r.path === '/api/auth/sign-up')?.body).toStrictEqual({
      email: 'ada@example.com',
      password: 'correct horse',
      name: 'Ada Lovelace',
      age: 36,
      education: "Master's degree (or equivalent)",
      first_language: 'English',
      fluency: 5,
    });
  });

  it('sends a signed-out visitor on the Google flow back to the start page', async () => {
    const router = renderAt('/sign-up?provider=google');

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });
});
