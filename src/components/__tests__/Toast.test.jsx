// Feature: placetrack-react-refactor — Toast unit tests
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../Toast.jsx';

describe('Toast', () => {
  it('renders the message', () => {
    render(<Toast message="Saved!" type="success" onDismiss={() => {}} />);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('applies success class for type="success"', () => {
    const { container } = render(
      <Toast message="OK" type="success" onDismiss={() => {}} />
    );
    const toast = container.firstChild;
    expect(toast.className).toMatch(/success/);
    expect(toast.className).not.toMatch(/warn/);
  });

  it('applies warn class for type="warn"', () => {
    const { container } = render(
      <Toast message="Warning" type="warn" onDismiss={() => {}} />
    );
    const toast = container.firstChild;
    expect(toast.className).toMatch(/warn/);
    expect(toast.className).not.toMatch(/success/);
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast message="msg" type="success" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has role="alert" for accessibility', () => {
    render(<Toast message="msg" type="success" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
