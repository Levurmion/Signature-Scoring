import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { FLUENCY_LEVELS } from './fluency-levels';
import { FluencySelect } from './FluencySelect';

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

describe('FluencySelect', () => {
  it('lists every fluency level and reports the numeric selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FluencySelect value={null} onValueChange={onValueChange} />);

    await user.click(screen.getByRole('combobox'));

    for (const level of FLUENCY_LEVELS) {
      expect(screen.getByRole('option', { name: level.label })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('option', { name: 'Conversational' }));

    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it('shows the label for the selected level', () => {
    render(<FluencySelect value={5} onValueChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Native/Bilingual');
  });

  it('forwards trigger props such as id and aria-invalid', () => {
    render(<FluencySelect id="fluency" aria-invalid value={null} onValueChange={vi.fn()} />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('id', 'fluency');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });
});
