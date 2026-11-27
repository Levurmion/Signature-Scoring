import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HighestLevelOfEducationCombobox } from './HighestLevelOfEducationCombobox';

describe('HighestLevelOfEducationCombobox', () => {
  it('lists every stage from primary school to doctorate under group labels', async () => {
    const user = userEvent.setup();
    render(<HighestLevelOfEducationCombobox value={null} onValueChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Higher education')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Primary school' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Doctorate (PhD, DPhil or equivalent)' }),
    ).toBeInTheDocument();
  });

  it('filters across groups and reports the selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<HighestLevelOfEducationCombobox value={null} onValueChange={onValueChange} />);

    await user.type(screen.getByRole('combobox'), 'master');

    expect(screen.queryByRole('option', { name: 'Primary school' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: "Master's degree (or equivalent)" }));

    expect(onValueChange).toHaveBeenLastCalledWith("Master's degree (or equivalent)");
  });
});
