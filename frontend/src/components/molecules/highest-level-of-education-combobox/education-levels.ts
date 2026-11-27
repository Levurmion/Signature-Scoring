export type EducationLevelGroup = {
  readonly value: string;
  readonly items: Array<string>;
};

/**
 * Qualifications from primary school to doctorate, ordered from lowest to
 * highest within and across groups. UK names are used, with "or equivalent"
 * so international qualifications map onto the nearest level.
 */
export const EDUCATION_LEVELS: Array<EducationLevelGroup> = [
  {
    value: 'School',
    items: [
      'No formal qualifications',
      'Primary school',
      'GCSEs, O Levels or Standard Grades (or equivalent)',
      'A Levels, Scottish Highers or International Baccalaureate (or equivalent)',
    ],
  },
  {
    value: 'Higher education',
    items: [
      'Undergraduate certificate or diploma (e.g. CertHE, DipHE)',
      "Bachelor's degree (or equivalent)",
      'Postgraduate certificate or diploma (e.g. PGCert, PGDip, PGCE)',
      "Master's degree (or equivalent)",
      'Doctorate (PhD, DPhil or equivalent)',
    ],
  },
  {
    value: 'Other',
    items: ['Other'],
  },
];
