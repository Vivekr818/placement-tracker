// Feature: placetrack-react-refactor, Property 4: Modal conditional rendering
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, cleanup, within } from '@testing-library/react';
import * as fc from 'fast-check';
import Modal from '../Modal.jsx';

describe('P4 — Modal children in DOM iff isOpen is true', () => {
  it('arbitrary isOpen boolean controls child visibility', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        (isOpen, content) => {
          const { container, unmount } = render(
            <Modal isOpen={isOpen} onClose={() => {}} title="T">
              <span data-testid="modal-child">{content}</span>
            </Modal>
          );
          if (isOpen) {
            // When open, the content should be in the rendered container
            expect(container.textContent).toContain(content);
          } else {
            // When closed, container should be empty
            expect(container.firstChild).toBeNull();
          }
          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
