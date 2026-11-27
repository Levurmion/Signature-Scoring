import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FirstLanguageCombobox } from './FirstLanguageCombobox';

describe('FirstLanguageCombobox', () => {
  it('filters languages as the user types and reports the selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FirstLanguageCombobox value={null} onValueChange={onValueChange} />);

    await user.type(screen.getByRole('combobox'), 'pol');

    expect(screen.getByRole('option', { name: 'Polish' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'English' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Polish' }));

    expect(onValueChange).toHaveBeenLastCalledWith('Polish');
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<FirstLanguageCombobox value={null} onValueChange={vi.fn()} />);

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByText('No languages found.')).toBeInTheDocument();
  });

  it('forwards input props such as id and aria-invalid', () => {
    render(<FirstLanguageCombobox id="lang" aria-invalid value={null} onValueChange={vi.fn()} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'lang');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
