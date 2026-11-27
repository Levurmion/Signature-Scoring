/**
 * --agent
 * The frontend's only sanctioned `throw` sites. Both mark defects (states the type system says
 * cannot happen, or a broken component tree), never expected failures.
 */

/** Raises a defect: something the program cannot continue from. */
export const panic = (message: string): never => {
  // oxlint-disable-next-line local-functional/no-throw-statements -- defects only
  throw new Error(message);
};

/**
 * Exhaustiveness check for `switch`es over tagged unions: `default: return assertNever(state)`
 * fails to type-check once a variant is left unhandled.
 */
export const assertNever = (value: never): never =>
  panic(`Unhandled variant: ${JSON.stringify(value)}`);
