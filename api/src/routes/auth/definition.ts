import { Schema, SchemaGetter } from 'effect';
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from 'effect/http-api';

import { Authentication } from '../../auth';
import { ConflictErrorSchema, DbErrorSchema, ValidationErrorSchema } from '../../lib/errors';
import { SignUpRequest, SignUpResponse } from '../users/definition';

export const SessionResponse = Schema.Struct({
  email: Schema.String,
}).annotate({ identifier: 'SessionResponse' });

export const OAuthCallbackQuery = Schema.Struct({
  code: Schema.optional(Schema.String),
});

// --agent
// Emails are compared case-insensitively everywhere (Supabase stores them lower-cased), so the
// payload is normalised on decode before the format check runs.
const Email = Schema.String.pipe(
  Schema.decodeTo(
    Schema.String.check(
      Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email address' }),
    ),
    {
      decode: SchemaGetter.transform((value: string) => value.trim().toLowerCase()),
      encode: SchemaGetter.transform((value: string) => value),
    },
  ),
);

export const EmailSignUpRequest = Schema.Struct({
  email: Email,
  // --agent
  // Supabase hashes passwords with bcrypt, which ignores everything past 72 bytes.
  password: Schema.String.check(Schema.isMinLength(8), Schema.isMaxLength(72)),
  ...SignUpRequest.fields,
});
export type EmailSignUpRequest = Schema.Schema.Type<typeof EmailSignUpRequest>;

// --agent
// Group `middleware` only covers endpoints already in the group, so session and sign-out come
// first and the public sign-in and email sign-up come after. Google profile sign-up sits beside
// the email one and carries `Authentication` itself: that caller already has a session.
export const authApiGroup = HttpApiGroup.make('auth')
  .add(
    HttpApiEndpoint.get('session', '/session', {
      success: SessionResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post('sign-out', '/sign-out', {
      success: HttpApiSchema.NoContent,
    }),
  )
  .middleware(Authentication)
  .add(HttpApiEndpoint.get('google', '/google'))
  .add(HttpApiEndpoint.get('callback', '/callback', { query: OAuthCallbackQuery }))
  .add(
    HttpApiEndpoint.post('sign-up', '/sign-up', {
      payload: EmailSignUpRequest,
      success: SignUpResponse.pipe(HttpApiSchema.status(201)),
      error: [ValidationErrorSchema, ConflictErrorSchema, DbErrorSchema],
    }),
  )
  .add(
    HttpApiEndpoint.post('google-sign-up', '/sign-up/google', {
      payload: SignUpRequest,
      success: SignUpResponse.pipe(HttpApiSchema.status(201)),
      error: [ValidationErrorSchema, ConflictErrorSchema, DbErrorSchema],
    }).middleware(Authentication),
  )
  .prefix('/auth');
