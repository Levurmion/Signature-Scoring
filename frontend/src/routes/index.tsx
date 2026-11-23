import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div className="h-full w-full">
      <p>Index</p>
    </div>
  ),
});
