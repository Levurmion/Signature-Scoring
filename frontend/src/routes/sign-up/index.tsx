import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { useQueryClient } from '@tanstack/react-query';
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
import { invalidateSession } from '@/lib/auth';

const Provider = Schema.Literals(['email', 'google']);
type Provider = typeof Provider.Type;
const isProvider = Schema.is(Provider);

export const Route = createFileRoute('/sign-up/')({
  // --agent
  // `google`: finishing a Google sign-in, so a session is required. `email`: creating the account
  // here, so the visitor is expected to be signed out. Anything else falls back to `google`.
  validateSearch: (search: Record<string, unknown>): { readonly provider: Provider } => ({
    provider: isProvider(search['provider']) ? search['provider'] : 'google',
  }),
  beforeLoad: ({ search }): Promise<void> =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => fetchClient.GET('/api/users/redirect', { cache: 'reload' }),
          catch: () => redirect({ to: '/' }),
        });

        yield* Option.match(Option.fromNullishOr(result.data), {
          onSome: () => Effect.fail(redirect({ to: '/home' })),
          onNone: () => {
            const tag = result.error?._tag;
            if (tag === 'UnauthorizedError') {
              return search.provider === 'email' ? Effect.void : Effect.fail(redirect({ to: '/' }));
            }
            // Signed in with Google but no profile yet: finish that sign-up instead.
            return tag === 'NotFoundError' && search.provider === 'email'
              ? Effect.fail(redirect({ to: '/sign-up', search: { provider: 'google' } }))
              : Effect.void;
          },
        });
      }),
    ),
  component: RouteComponent,
});

const requiredString = (message: string) =>
  Schema.String.annotate({ message })
    .annotateKey({ messageMissingKey: message })
    .check(Schema.isTrimmed({ message }), Schema.isNonEmpty({ message }));

const profileFields = {
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
};

const emailMessage = 'Enter a valid email address';
const passwordMessage = 'Password must be 8–72 characters';

// --agent
// Both schemas decode to the same shape so one form type serves both providers; only the email
// flow validates the credential fields (the Google flow never renders or submits them).
const SignUpFormSchema = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
  ...profileFields,
});
const EmailSignUpFormSchema = Schema.Struct({
  email: Schema.String.annotate({ message: emailMessage })
    .annotateKey({ messageMissingKey: emailMessage })
    .check(Schema.isPattern(/^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/, { message: emailMessage })),
  password: Schema.String.annotate({ message: passwordMessage })
    .annotateKey({ messageMissingKey: passwordMessage })
    .check(
      Schema.isMinLength(8, { message: passwordMessage }),
      Schema.isMaxLength(72, { message: passwordMessage }),
    ),
  ...profileFields,
});
type SignUpFormValues = typeof SignUpFormSchema.Type;

function RouteComponent() {
  const { provider } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<SignUpFormValues>({
    resolver:
      provider === 'email'
        ? effectTsResolver(EmailSignUpFormSchema)
        : effectTsResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSignedUp = () => invalidateSession(queryClient).then(() => navigate({ to: '/home' }));

  const googleSignUp = $api.useMutation('post', '/api/users/sign-up', { onSuccess: onSignedUp });
  const emailSignUp = $api.useMutation('post', '/api/auth/sign-up', {
    onSuccess: onSignedUp,
    onError: (error) => {
      if (error._tag === 'ConflictError') {
        form.setError(
          'email',
          { message: 'An account with this email already exists.' },
          { shouldFocus: true },
        );
      }
    },
  });

  const onSubmit = ({ email, password, ...profile }: SignUpFormValues) =>
    provider === 'email'
      ? emailSignUp.mutate({ body: { email: email.trim(), password, ...profile } })
      : googleSignUp.mutate({ body: profile });

  const isPending = googleSignUp.isPending || emailSignUp.isPending;
  // The email conflict is shown on the email field; everything else goes in the summary line.
  const generalError = Option.match(
    Option.fromNullishOr(provider === 'email' ? emailSignUp.error : googleSignUp.error),
    {
      onNone: () => null,
      onSome: (error) =>
        error._tag === 'ConflictError'
          ? provider === 'email'
            ? null
            : 'You have already signed up.'
          : 'message' in error
            ? error.message
            : 'Something went wrong. Please try again.',
    },
  );

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
            {provider === 'email' ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}
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
            {generalError ? <p className="text-sm text-destructive">{generalError}</p> : null}
            <Button type="submit" disabled={isPending}>
              Sign up
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
