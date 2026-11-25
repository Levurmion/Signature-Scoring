import { Schema } from 'effect';
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from 'effect/http-api';

import { Authentication } from '../../auth';
import {
  ConflictErrorSchema,
  DbErrorSchema,
  NotFoundErrorSchema,
  ValidationErrorSchema,
} from '../../lib/errors';

export const SignUpRequest = Schema.Struct({
  age: Schema.Number,
  education: Schema.String,
  first_language: Schema.String,
  fluency: Schema.Number,
  name: Schema.String,
});
export type SignUpRequest = Schema.Schema.Type<typeof SignUpRequest>;

export const SignUpResponse = Schema.Struct({
  ...SignUpRequest.fields,
  id: Schema.String,
});
export type SignUpResponse = Schema.Schema.Type<typeof SignUpResponse>;

export const usersApiGroup = HttpApiGroup.make('users')
  .add(
    HttpApiEndpoint.get('redirect', '/redirect', {
      success: SignUpResponse,
      error: [NotFoundErrorSchema, DbErrorSchema],
    }),
  )
  .add(
    HttpApiEndpoint.post('sign-up', '/sign-up', {
      payload: SignUpRequest,
      success: SignUpResponse,
      error: [ValidationErrorSchema, ConflictErrorSchema, DbErrorSchema],
    }),
  )
  .middleware(Authentication);

export const usersApiDefinition = HttpApi.make('users').add(usersApiGroup);
