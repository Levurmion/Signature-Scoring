import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Effect, Option, Schema } from 'effect';
import { useForm } from 'react-hook-form';

import { FirstLanguageCombobox } from '@/components/molecules/first-language-combobox';
import { FluencySelect } from '@/components/molecules/fluency-select';
import { HighestLevelOfEducationCombobox } from '@/components/molecules/highest-level-of-education-combobox';
import { NumberInput } from '@/components/reui/number-field';
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

const requiredString = (message: string) =>
  Schema.String.annotate({ message })
    .annotateKey({ messageMissingKey: message })
    .check(Schema.isTrimmed({ message }), Schema.isNonEmpty({ message }));

const SignUpFormSchema = Schema.Struct({
  name: requiredString('Name is required'),
  age: Schema.Number.annotate({ message: 'You must be at least 18' })
    .annotateKey({ messageMissingKey: 'You must be at least 18' })
    .check(
      Schema.isGreaterThanOrEqualTo(18, { message: 'You must be at least 18' }),
      Schema.isLessThanOrEqualTo(100, { message: 'Age cannot exceed 100' }),
    ),
  education: requiredString('Education is required'),
  first_language: requiredString('First language is required'),
  fluency: Schema.Literals([1, 2, 3, 4, 5])
    .annotate({ message: 'Fluency is required' })
    .annotateKey({ messageMissingKey: 'Fluency is required' }),
});
type SignUpFormValues = typeof SignUpFormSchema.Type;

function RouteComponent() {
  const navigate = useNavigate();
  const form = useForm<SignUpFormValues>({
    resolver: effectTsResolver(SignUpFormSchema),
    mode: 'onBlur',
  });
  const signUp = $api.useMutation('post', '/api/users/sign-up', {
    onSuccess: () => navigate({ to: '/home' }),
  });

  const onSubmit = (values: SignUpFormValues) =>
    signUp.mutate({
      body: {
        name: values.name,
        age: values.age,
        education: values.education,
        first_language: values.first_language,
        fluency: values.fluency,
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input inputMode="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <NumberInput
                        name={field.name}
                        value={field.value ?? null}
                        onBlur={field.onBlur}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                        step={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_language"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>First language</FormLabel>
                    <FormControl>
                      <FirstLanguageCombobox
                        name={field.name}
                        value={field.value ?? null}
                        onBlur={field.onBlur}
                        onValueChange={(value) => field.onChange(value ?? '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Level of Education</FormLabel>
                  <FormControl>
                    <HighestLevelOfEducationCombobox
                      name={field.name}
                      value={field.value ?? null}
                      onBlur={field.onBlur}
                      onValueChange={(value) => field.onChange(value ?? '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fluency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fluency</FormLabel>
                  <FormControl>
                    <FluencySelect
                      name={field.name}
                      value={field.value ?? null}
                      onBlur={field.onBlur}
                      onValueChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
