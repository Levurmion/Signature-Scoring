import { createFileRoute } from '@tanstack/react-router';

import { AuthSection } from '@/components/molecules/auth-section';

export const IndexPage = () => <AuthSection />;

export const Route = createFileRoute('/')({
  component: IndexPage,
});
