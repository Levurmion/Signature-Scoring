import { Match, Schema } from 'effect';
import { HttpApiSchema } from 'effect/http-api';

export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  message: Schema.String,
}) {}

export const ValidationErrorSchema = ValidationError.pipe(HttpApiSchema.status(422));

export class BadRequestError extends Schema.TaggedError<BadRequestError>()('BadRequestError', {
  message: Schema.String,
}) {}
export const BadRequestErrorSchema = BadRequestError.pipe(HttpApiSchema.status(400));

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  'UnauthorizedError',
  {
    message: Schema.String,
  },
) {}
export const UnauthorizedErrorSchema = UnauthorizedError.pipe(HttpApiSchema.status(401));

export class NotFoundError extends Schema.TaggedError<NotFoundError>()('NotFoundError', {
  message: Schema.String,
}) {}
export const NotFoundErrorSchema = NotFoundError.pipe(HttpApiSchema.status(404));

export class ConflictError extends Schema.TaggedError<ConflictError>()('ConflictError', {}) {}
export const ConflictErrorSchema = ConflictError.pipe(HttpApiSchema.status(409));

export class DbError extends Schema.TaggedError<DbError>()('DbError', {
  message: Schema.String,
}) {}
export const DbErrorSchema = DbError.pipe(HttpApiSchema.status(500));

export const ApiError = Schema.Union([
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  DbError,
]);
export type ApiError = typeof ApiError.Type;

export const decodeApiError = Schema.decodeUnknownOption(ApiError);

export const isValidationError = Schema.is(ValidationError);
export const isBadRequestError = Schema.is(BadRequestError);
export const isUnauthorizedError = Schema.is(UnauthorizedError);
export const isNotFoundError = Schema.is(NotFoundError);
export const isConflictError = Schema.is(ConflictError);
export const isDbError = Schema.is(DbError);

export const apiErrorMatcher = Match.type<ApiError>();
