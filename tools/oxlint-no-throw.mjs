/**
 * --human
 * A minimal, dependency-free oxlint JS plugin (oxlint's JS plugin API is ESLint v9+ compatible)
 * that flags `throw` statements.
 *
 * `eslint-plugin-functional` (the fuller-featured alternative) pulls in
 * `@typescript-eslint/type-utils`, which still requires the classic TypeScript compiler API that
 * TypeScript 7's native compiler removed, so it crashes on load in this repo. This rule only needs
 * the AST, not type information, so it avoids that dependency entirely. See
 * `.cursor/rules/functional-effect.mdc` for the broader functional-programming conventions this
 * rule partially enforces.
 */
export default {
  rules: {
    'no-throw-statements': {
      create(context) {
        return {
          ThrowStatement(node) {
            context.report({
              node,
              message:
                'Do not use `throw`. Model expected failures as values (e.g. a tagged error in an Effect error channel) instead.',
            });
          },
        };
      },
    },
  },
};
