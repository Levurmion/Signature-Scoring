export const FLUENCY_LEVELS = [
  { value: 1, label: 'Elementary Proficiency' },
  { value: 2, label: 'Conversational' },
  { value: 3, label: 'Professional Working Proficiency' },
  { value: 4, label: 'Academic Proficiency' },
  { value: 5, label: 'Native/Bilingual' },
] as const;

export type Fluency = (typeof FLUENCY_LEVELS)[number]['value'];
