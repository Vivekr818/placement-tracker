// Feature: placetrack-react-refactor — Modal unit tests
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal.jsx';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Content')).toBeNull();
  });

  it('renders children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders the title when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Dialog">
        <p>body</p>
      </Modal>
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>body</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>body</p>
      </Modal>
    );
    // The backdrop is the outermost div with role="presentation"
    const backdrop = container.querySelector('[role="presentation"]');
    fireEvent.click(backdrop, { target: backdrop });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>body</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when a non-Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>body</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has role="dialog" on the dialog element', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="T">
        <p>body</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
