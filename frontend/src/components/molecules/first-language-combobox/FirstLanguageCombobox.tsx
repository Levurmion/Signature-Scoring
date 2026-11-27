import type { ComponentProps } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

import { LANGUAGES } from './languages';

type FirstLanguageComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  readonly value: string | null;
  readonly onValueChange: (value: string | null) => void;
  readonly name?: string;
};

/**
 * Searchable picker for a first language spoken in the UK. Extra props (id,
 * aria-*, onBlur, …) go to the text input, so it works inside `FormControl`.
 */
export const FirstLanguageCombobox = ({
  value,
  onValueChange,
  name,
  className,
  placeholder = 'Select a language',
  ...inputProps
}: FirstLanguageComboboxProps) => (
  <Combobox
    items={LANGUAGES}
    name={name}
    value={value}
    onValueChange={(next) => onValueChange(next)}
  >
    <ComboboxInput className={cn('w-full', className)} placeholder={placeholder} {...inputProps} />
    <ComboboxContent>
      <ComboboxEmpty>No languages found.</ComboboxEmpty>
      <ComboboxList>
        {(language: string) => (
          <ComboboxItem key={language} value={language}>
            {language}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);
