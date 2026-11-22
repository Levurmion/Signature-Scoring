import { Schema } from 'effect';
import { HttpApiSchema } from 'effect/http-api';

/**
 * Domain errors, modeled as schema-backed tagged errors so `HttpApi` can encode them straight
 * into an HTTP response, no manual response-building boundary needed.
 *
 * Each error is exported twice:
 * - The plain class (`ValidationError`, ...) is what route handlers construct and fail with,
 *   e.g. `Effect.fail(new ValidationError({ message: "..." }))`.
 * - The `*Schema` alias has an `HttpApiSchema.status` annotation applied via `.pipe`, and is what
 *   a route declares in its `error` option. The framework uses that annotation to pick the HTTP
 *   status code when it encodes a failure of this shape.
 */

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
