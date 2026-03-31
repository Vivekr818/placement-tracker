// Feature: placetrack-react-refactor — StatCard unit tests
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard.jsx';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total" value={42} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatCard label="Score" value="10 / 20" />);
    expect(screen.getByText('10 / 20')).toBeInTheDocument();
  });

  it('does not render sub when prop is not provided', () => {
    const { container } = render(<StatCard label="L" value="V" />);
    // No sub element should be present
    expect(container.querySelector('[class*="sub"]')).toBeNull();
  });

  it('renders sub when prop is provided', () => {
    render(<StatCard label="L" value="V" sub="secondary text" />);
    expect(screen.getByText('secondary text')).toBeInTheDocument();
  });

  it('does not render icon when prop is not provided', () => {
    const { container } = render(<StatCard label="L" value="V" />);
    expect(container.querySelector('[class*="icon"]')).toBeNull();
  });

  it('renders icon when prop is provided', () => {
    render(<StatCard label="L" value="V" icon="🎯" />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('applies borderTopColor inline style when color is provided', () => {
    const { container } = render(<StatCard label="L" value="V" color="#ff0000" />);
    const card = container.firstChild;
    expect(card.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });

  it('does not apply inline style when color is not provided', () => {
    const { container } = render(<StatCard label="L" value="V" />);
    const card = container.firstChild;
    expect(card.style.borderTopColor).toBe('');
  });
});
