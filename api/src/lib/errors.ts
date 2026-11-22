import { Schema } from 'effect';
import { HttpApiSchema } from 'effect/http-api';

export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  message: Schema.String,
}) {}
export const ValidationErrorSchema = ValidationError.pipe(HttpApiSchema.status(400));

export class NotFoundError extends Schema.TaggedError<NotFoundError>()('NotFoundError', {
  message: Schema.String,
}) {}
export const NotFoundErrorSchema = NotFoundError.pipe(HttpApiSchema.status(404));

export class DbError extends Schema.TaggedError<DbError>()('DbError', {
  message: Schema.String,
}) {}
export const DbErrorSchema = DbError.pipe(HttpApiSchema.status(500));
