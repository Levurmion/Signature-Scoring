import type { ComponentProps } from 'react';

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

import { EDUCATION_LEVELS, type EducationLevelGroup } from './education-levels';

type HighestLevelOfEducationComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
  readonly name?: string;
};

/**
 * Searchable picker for the highest qualification held, grouped by stage of
 * education. Extra props (id, aria-*, onBlur, …) go to the text input, so it
 * works inside `FormControl`.
 */
export const HighestLevelOfEducationCombobox = ({
  value,
  onValueChange,
  name,
  className,
  placeholder = 'Select a qualification',
  ...inputProps
}: HighestLevelOfEducationComboboxProps) => (
  <Combobox
    items={EDUCATION_LEVELS}
    name={name}
    value={value}
    onValueChange={(next) => onValueChange(next)}
  >
    <ComboboxInput className={cn('w-full', className)} placeholder={placeholder} {...inputProps} />
    <ComboboxContent>
      <ComboboxEmpty>No qualifications found.</ComboboxEmpty>
      <ComboboxList>
        {(group: EducationLevelGroup) => (
          <ComboboxGroup key={group.value} items={group.items}>
            <ComboboxLabel>{group.value}</ComboboxLabel>
            <ComboboxCollection>
              {(level: string) => (
                <ComboboxItem key={level} value={level}>
                  {level}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);
