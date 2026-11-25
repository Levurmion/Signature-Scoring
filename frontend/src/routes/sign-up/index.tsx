import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Effect, Option, Schema } from 'effect';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { $api, fetchClient } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';

export const Route = createFileRoute('/sign-up/')({
  beforeLoad: (): Promise<void> =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { data } = yield* Effect.tryPromise(() => supabase.auth.getSession());

        yield* Option.match(Option.fromNullOr(data.session), {
          onNone: () => Effect.fail(redirect({ to: '/' })),
          onSome: () => Effect.void,
        });

        const result = yield* Effect.tryPromise({
          try: () => fetchClient.GET('/api/users/redirect', { cache: 'reload' }),
          catch: () => redirect({ to: '/' }),
        });

        yield* Option.match(Option.fromNullishOr(result.data), {
          onNone: () =>
            result.error?._tag === 'UnauthorizedError'
              ? Effect.fail(redirect({ to: '/' }))
              : Effect.void,
          onSome: () => Effect.fail(redirect({ to: '/home' })),
        });
      }),
    ),
  component: RouteComponent,
});

const requiredText = (message: string) =>
  Schema.String.check(Schema.isTrimmed({ message }), Schema.isNonEmpty({ message }));

const nonNegativeInteger = (message: string) =>
  Schema.String.check(Schema.isPattern(/^\d+$/, { message }));

const SignUpFormSchema = Schema.Struct({
  name: requiredText('Name is required'),
  age: nonNegativeInteger('Age must be a whole number'),
  education: requiredText('Education is required'),
  first_language: requiredText('First language is required'),
  fluency: nonNegativeInteger('Fluency must be a whole number'),
});
type SignUpFormValues = typeof SignUpFormSchema.Type;

const defaultValues: SignUpFormValues = {
  name: '',
  age: '',
  education: '',
  first_language: '',
  fluency: '',
};

const fields = [
  { name: 'name', label: 'Name', inputMode: 'text' },
  { name: 'age', label: 'Age', inputMode: 'numeric' },
  { name: 'education', label: 'Education', inputMode: 'text' },
  { name: 'first_language', label: 'First language', inputMode: 'text' },
  { name: 'fluency', label: 'Fluency', inputMode: 'numeric' },
] as const;

function RouteComponent() {
  const navigate = useNavigate();
  const form = useForm<SignUpFormValues>({
    resolver: effectTsResolver(SignUpFormSchema),
    defaultValues,
  });
  const signUp = $api.useMutation('post', '/api/users/sign-up', {
    onSuccess: () => navigate({ to: '/home' }),
  });

  const onSubmit = (values: SignUpFormValues) =>
    signUp.mutate({
      body: {
        name: values.name,
        age: Number(values.age),
        education: values.education,
        first_language: values.first_language,
        fluency: Number(values.fluency),
      },
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            {fields.map(({ name, label, inputMode }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input inputMode={inputMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {signUp.error ? (
              <p className="text-sm text-destructive">
                {signUp.error._tag === 'ConflictError'
                  ? 'You have already signed up.'
                  : signUp.error.message}
              </p>
            ) : null}
            <Button type="submit" disabled={signUp.isPending}>
              Sign up
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
