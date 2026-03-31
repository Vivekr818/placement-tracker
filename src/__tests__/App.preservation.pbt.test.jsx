// Feature: sidebar-layout-fix, Property 2: Preservation - Visual Styling and Behavior Preserved When CSS Modules Load
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * Preservation Property Tests
 * 
 * These tests verify that when CSS Modules load successfully, all visual styling,
 * responsive behavior, and user interactions continue to work exactly as before.
 * 
 * IMPORTANT: These tests follow observation-first methodology:
 * 1. Run on UNFIXED code to observe baseline behavior
 * 2. Tests should PASS on unfixed code (confirming baseline to preserve)
 * 3. After fix is implemented, tests should still PASS (confirming no regressions)
 * 
 * The tests verify:
 * - CSS Module classes are still applied to elements (not replaced by inline styles)
 * - Inline styles are ADDITIVE (they supplement CSS Modules, not replace them)
 * - Desktop layout structure is preserved (220px sidebar, main area margin)
 * - Mobile responsive behavior is preserved (CSS Module media queries still work)
 * - All visual styling from CSS Modules continues to work
 * 
 * APPROACH: Use source code inspection to verify that:
 * 1. CSS Module className attributes are still present
 * 2. Inline styles are added alongside className (not replacing it)
 * 3. CSS Module files are unchanged (all visual styling preserved)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('P2 — Visual Styling and Behavior Preserved When CSS Modules Load', () => {
  it('sidebar maintains CSS Module className alongside inline styles', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.jsx source code
          const sidebarJsxPath = path.resolve(__dirname, '../components/Sidebar.jsx');
          const sidebarJsxContent = fs.readFileSync(sidebarJsxPath, 'utf-8');

          // Verify sidebar has BOTH className and style attributes
          // Pattern: className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} style={{ ... }}
          const hasClassName = sidebarJsxContent.includes('className=') && 
                               sidebarJsxContent.includes('styles.sidebar');
          const hasInlineStyle = sidebarJsxContent.includes('style={{');
          
          // Verify they appear on the same element (aside)
          const asideMatch = sidebarJsxContent.match(/<aside[^>]*>/);
          if (asideMatch) {
            const asideTag = asideMatch[0];
            const hasBothInAside = asideTag.includes('className') && asideTag.includes('style');
            expect(hasBothInAside).toBe(true);
          }
          
          expect(hasClassName).toBe(true);
          expect(hasInlineStyle).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('main area maintains CSS Module className alongside inline style', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read App.jsx source code
          const appJsxPath = path.resolve(__dirname, '../App.jsx');
          const appJsxContent = fs.readFileSync(appJsxPath, 'utf-8');

          // Verify main area has BOTH className and style attributes
          // Pattern: <div className={styles.mainArea} style={{ marginLeft: 220 }}>
          const hasClassName = appJsxContent.includes('className={styles.mainArea}');
          const hasInlineStyle = appJsxContent.includes('style={{ marginLeft: 220 }}');
          
          // Verify they appear together
          const mainAreaMatch = appJsxContent.match(/className=\{styles\.mainArea\}[^>]*style=\{\{ marginLeft: 220 \}\}/);
          expect(mainAreaMatch).toBeTruthy();
          
          expect(hasClassName).toBe(true);
          expect(hasInlineStyle).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Sidebar.module.css is unchanged - all visual styling preserved', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.module.css
          const sidebarCssPath = path.resolve(__dirname, '../components/Sidebar.module.css');
          const sidebarCssContent = fs.readFileSync(sidebarCssPath, 'utf-8');

          // Verify key visual styling properties are still present
          expect(sidebarCssContent).toContain('background: var(--bg2)');
          expect(sidebarCssContent).toContain('border-right: 1px solid var(--border)');
          expect(sidebarCssContent).toContain('transition: all 0.15s');
          expect(sidebarCssContent).toContain('.navItem:hover');
          expect(sidebarCssContent).toContain('.navItem.active');
          
          // Verify mobile responsive behavior is preserved
          expect(sidebarCssContent).toContain('@media (max-width: 768px)');
          expect(sidebarCssContent).toContain('transform: translateX(-100%)');
          expect(sidebarCssContent).toContain('transform: translateX(0)');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('App.module.css is unchanged - all layout styling preserved', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read App.module.css
          const appCssPath = path.resolve(__dirname, '../App.module.css');
          const appCssContent = fs.readFileSync(appCssPath, 'utf-8');

          // Verify main area CSS Module styling is still present
          expect(appCssContent).toContain('.mainArea');
          expect(appCssContent).toContain('margin-left: 220px');
          expect(appCssContent).toContain('min-height: 100vh');
          expect(appCssContent).toContain('display: flex');
          expect(appCssContent).toContain('flex-direction: column');
          
          // Verify mobile responsive behavior is preserved
          expect(appCssContent).toContain('@media (max-width: 768px)');
          expect(appCssContent).toContain('margin-left: 0');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('sidebar CSS Module classes are not removed or replaced', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.jsx source code
          const sidebarJsxPath = path.resolve(__dirname, '../components/Sidebar.jsx');
          const sidebarJsxContent = fs.readFileSync(sidebarJsxPath, 'utf-8');

          // Verify all CSS Module class references are still present
          expect(sidebarJsxContent).toContain('styles.sidebar');
          expect(sidebarJsxContent).toContain('styles.open');
          expect(sidebarJsxContent).toContain('styles.brand');
          expect(sidebarJsxContent).toContain('styles.brandName');
          expect(sidebarJsxContent).toContain('styles.brandIcon');
          expect(sidebarJsxContent).toContain('styles.brandSub');
          expect(sidebarJsxContent).toContain('styles.nav');
          expect(sidebarJsxContent).toContain('styles.navItem');
          expect(sidebarJsxContent).toContain('styles.active');
          expect(sidebarJsxContent).toContain('styles.navIcon');
          expect(sidebarJsxContent).toContain('styles.navLabel');
          expect(sidebarJsxContent).toContain('styles.streakBadge');
          expect(sidebarJsxContent).toContain('styles.userSection');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('App CSS Module classes are not removed or replaced', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read App.jsx source code
          const appJsxPath = path.resolve(__dirname, '../App.jsx');
          const appJsxContent = fs.readFileSync(appJsxPath, 'utf-8');

          // Verify all CSS Module class references are still present
          expect(appJsxContent).toContain('styles.appShell');
          expect(appJsxContent).toContain('styles.backdrop');
          expect(appJsxContent).toContain('styles.mainArea');
          expect(appJsxContent).toContain('styles.pageContent');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('inline styles are minimal and only for critical layout properties', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.jsx
          const sidebarJsxPath = path.resolve(__dirname, '../components/Sidebar.jsx');
          const sidebarJsxContent = fs.readFileSync(sidebarJsxPath, 'utf-8');

          // Verify inline styles only contain critical layout properties
          // Should NOT contain visual styling like colors, borders, transitions
          expect(sidebarJsxContent).not.toContain('background:');
          expect(sidebarJsxContent).not.toContain('border:');
          expect(sidebarJsxContent).not.toContain('color:');
          expect(sidebarJsxContent).not.toContain('transition:');
          
          // Read App.jsx
          const appJsxPath = path.resolve(__dirname, '../App.jsx');
          const appJsxContent = fs.readFileSync(appJsxPath, 'utf-8');

          // Main area inline style should only contain margin-left
          const mainAreaStyleMatch = appJsxContent.match(/className=\{styles\.mainArea\}[^>]*style=\{\{([^}]+)\}\}/);
          if (mainAreaStyleMatch) {
            const styleContent = mainAreaStyleMatch[1];
            // Should only contain marginLeft, nothing else
            expect(styleContent.trim()).toBe('marginLeft: 220');
          }
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('desktop layout structure is preserved (220px sidebar, main area margin)', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.jsx
          const sidebarJsxPath = path.resolve(__dirname, '../components/Sidebar.jsx');
          const sidebarJsxContent = fs.readFileSync(sidebarJsxPath, 'utf-8');

          // Verify sidebar width is 220px (from inline styles)
          expect(sidebarJsxContent).toContain('width: 220');
          
          // Read App.jsx
          const appJsxPath = path.resolve(__dirname, '../App.jsx');
          const appJsxContent = fs.readFileSync(appJsxPath, 'utf-8');

          // Verify main area margin-left is 220px (from inline styles)
          expect(appJsxContent).toContain('marginLeft: 220');
          
          // Read CSS files to verify CSS Module values match
          const sidebarCssPath = path.resolve(__dirname, '../components/Sidebar.module.css');
          const sidebarCssContent = fs.readFileSync(sidebarCssPath, 'utf-8');
          expect(sidebarCssContent).toContain('width: 220px');
          
          const appCssPath = path.resolve(__dirname, '../App.module.css');
          const appCssContent = fs.readFileSync(appCssPath, 'utf-8');
          expect(appCssContent).toContain('margin-left: 220px');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('mobile responsive behavior is preserved in CSS Modules', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.module.css
          const sidebarCssPath = path.resolve(__dirname, '../components/Sidebar.module.css');
          const sidebarCssContent = fs.readFileSync(sidebarCssPath, 'utf-8');

          // Verify mobile media query is present
          expect(sidebarCssContent).toContain('@media (max-width: 768px)');
          
          // Verify mobile sidebar behavior (overlay with transform)
          const mobileSection = sidebarCssContent.substring(
            sidebarCssContent.indexOf('@media (max-width: 768px)')
          );
          expect(mobileSection).toContain('position: fixed');
          expect(mobileSection).toContain('transform: translateX(-100%)');
          expect(mobileSection).toContain('transform: translateX(0)');
          expect(mobileSection).toContain('transition: transform 0.25s ease');
          
          // Read App.module.css
          const appCssPath = path.resolve(__dirname, '../App.module.css');
          const appCssContent = fs.readFileSync(appCssPath, 'utf-8');

          // Verify mobile main area behavior (no margin)
          const appMobileSection = appCssContent.substring(
            appCssContent.indexOf('@media (max-width: 768px)')
          );
          expect(appMobileSection).toContain('margin-left: 0');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('all user interaction styling is preserved (hover states, active states)', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Read Sidebar.module.css
          const sidebarCssPath = path.resolve(__dirname, '../components/Sidebar.module.css');
          const sidebarCssContent = fs.readFileSync(sidebarCssPath, 'utf-8');

          // Verify hover states are preserved
          expect(sidebarCssContent).toContain('.navItem:hover');
          expect(sidebarCssContent).toContain('background: var(--bg4)');
          
          // Verify active states are preserved
          expect(sidebarCssContent).toContain('.navItem.active');
          expect(sidebarCssContent).toContain('background: var(--accent-bg)');
          expect(sidebarCssContent).toContain('color: var(--accent2)');
          
          // Verify sign out button hover is preserved
          expect(sidebarCssContent).toContain('.signOutBtn:hover');
          expect(sidebarCssContent).toContain('color: var(--red)');
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
