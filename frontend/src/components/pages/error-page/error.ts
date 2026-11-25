import { Option, pipe, Predicate } from 'effect';

export const errorDetail = (error: unknown): Option.Option<string> =>
  pipe(
    Option.liftPredicate(error, Predicate.isError),
    Option.map((cause) => cause.message.trim()),
    Option.filter((message) => message.length > 0),
  );
