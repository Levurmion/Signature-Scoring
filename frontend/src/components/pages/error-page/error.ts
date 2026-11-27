/** The trimmed message of a thrown `Error`, or `null` when there is nothing worth showing. */
export const errorDetail = (error: unknown): string | null => {
  const message = error instanceof Error ? error.message.trim() : '';
  return message.length > 0 ? message : null;
};
