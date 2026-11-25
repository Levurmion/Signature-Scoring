import { Schema } from 'effect';
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from 'effect/http-api';

import { Authentication } from '../../auth';
import {
  ConflictErrorSchema,
  DbErrorSchema,
  NotFoundErrorSchema,
  ValidationErrorSchema,
} from '../../lib/errors';

const fluencySchema = Schema.Literals([1, 2, 3, 4, 5]);

export const SignUpRequest = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  education: Schema.String,
  first_language: Schema.String,
  fluency: fluencySchema,
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
      success: SignUpResponse.pipe(HttpApiSchema.status(200)),
      error: [NotFoundErrorSchema, DbErrorSchema],
    }),
  )
  .add(
    HttpApiEndpoint.post('sign-up', '/sign-up', {
      payload: SignUpRequest,
      success: SignUpResponse.pipe(HttpApiSchema.status(201)),
      error: [ValidationErrorSchema, ConflictErrorSchema, DbErrorSchema],
    }),
  )
  .middleware(Authentication)
  .prefix('/users');
