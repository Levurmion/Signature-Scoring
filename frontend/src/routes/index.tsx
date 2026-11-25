import { createFileRoute } from '@tanstack/react-router';

import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: () => (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <p>Thank you for signing up for this project! This app is currently in development.</p>
        <p>Please sign in with your google account to continue.</p>
      </CardContent>
    </Card>
  ),
});
