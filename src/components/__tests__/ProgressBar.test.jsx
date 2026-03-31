// Feature: placetrack-react-refactor — ProgressBar unit tests
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressBar from '../ProgressBar.jsx';

function getFillWidth(container) {
  const fill = container.querySelector('[class*="fill"]');
  return fill?.style.width ?? '';
}

describe('ProgressBar', () => {
  it('renders label text', () => {
    const { getByText } = render(<ProgressBar label="Applied" value={3} max={10} />);
    expect(getByText('Applied')).toBeInTheDocument();
  });

  it('fill is 0% when value is 0', () => {
    const { container } = render(<ProgressBar label="L" value={0} max={10} />);
    expect(getFillWidth(container)).toBe('0%');
  });

  it('fill is 100% when value equals max', () => {
    const { container } = render(<ProgressBar label="L" value={10} max={10} />);
    expect(getFillWidth(container)).toBe('100%');
  });

  it('fill is 50% when value is half of max', () => {
    const { container } = render(<ProgressBar label="L" value={5} max={10} />);
    expect(getFillWidth(container)).toBe('50%');
  });

  it('clamps fill to 100% when value exceeds max', () => {
    const { container } = render(<ProgressBar label="L" value={200} max={10} />);
    expect(getFillWidth(container)).toBe('100%');
  });

  it('clamps fill to 0% when value is negative', () => {
    const { container } = render(<ProgressBar label="L" value={-5} max={10} />);
    expect(getFillWidth(container)).toBe('0%');
  });

  it('fill is 0% when max is 0 (no division by zero)', () => {
    const { container } = render(<ProgressBar label="L" value={5} max={0} />);
    expect(getFillWidth(container)).toBe('0%');
  });

  it('fill is 0% when max is negative', () => {
    const { container } = render(<ProgressBar label="L" value={5} max={-10} />);
    expect(getFillWidth(container)).toBe('0%');
  });

  it('applies custom color to fill', () => {
    const { container } = render(<ProgressBar label="L" value={5} max={10} color="#10b981" />);
    const fill = container.querySelector('[class*="fill"]');
    expect(fill?.style.backgroundColor).toBe('rgb(16, 185, 129)');
  });
});
