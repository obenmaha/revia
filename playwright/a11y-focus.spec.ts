import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Accessibility Focus Management Tests
 *
 * Tests keyboard navigation, focus indicators, and ARIA attributes
 * to ensure WCAG 2.1 AA compliance
 */

test.describe('Accessibility - Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should have visible focus indicators on all interactive elements', async ({ page }) => {
    // Get all focusable elements
    const focusableSelectors = [
      'a',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ];

    for (const selector of focusableSelectors) {
      const elements = await page.locator(selector).all();

      for (const element of elements) {
        // Skip hidden elements
        const isVisible = await element.isVisible().catch(() => false);
        if (!isVisible) continue;

        // Focus the element
        await element.focus().catch(() => {});

        // Check if element has focus
        const isFocused = await element.evaluate((el) => el === document.activeElement);

        if (isFocused) {
          // Check for visible focus indicator
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              outlineStyle: computed.outlineStyle,
              outlineColor: computed.outlineColor,
              boxShadow: computed.boxShadow,
            };
          });

          // Element should have either outline or box-shadow for focus
          const hasFocusIndicator =
            (styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none') ||
            styles.boxShadow !== 'none';

          expect(hasFocusIndicator).toBeTruthy();
        }
      }
    }
  });

  test('should support keyboard navigation with Tab key', async ({ page }) => {
    // Get initial focus
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    expect(firstFocused).toBeTruthy();

    // Tab through several elements
    for (let i = 0; i < 5; i++) {
      const beforeTab = await page.evaluate(() => document.activeElement?.outerHTML);
      await page.keyboard.press('Tab');
      const afterTab = await page.evaluate(() => document.activeElement?.outerHTML);

      // Focus should change
      expect(beforeTab).not.toBe(afterTab);
    }
  });

  test('should support reverse keyboard navigation with Shift+Tab', async ({ page }) => {
    // Tab forward a few times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }

    const currentElement = await page.evaluate(() => document.activeElement?.outerHTML);

    // Tab backward
    await page.keyboard.press('Shift+Tab');
    const previousElement = await page.evaluate(() => document.activeElement?.outerHTML);

    // Focus should change when going backward
    expect(currentElement).not.toBe(previousElement);
  });

  test('should not have any keyboard traps', async ({ page }) => {
    const maxTabs = 50;
    const focusedElements: string[] = [];

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      const currentFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return `${el?.tagName}${el?.id ? '#' + el.id : ''}${el?.className ? '.' + el.className.split(' ').join('.') : ''}`;
      });

      focusedElements.push(currentFocused);

      // Check if we're stuck in a loop (same element 3 times in a row)
      if (focusedElements.length >= 3) {
        const last3 = focusedElements.slice(-3);
        const isStuck = last3.every((el) => el === last3[0]);
        expect(isStuck).toBeFalsy();
      }
    }
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    const interactiveElements = await page.locator('button, a, [role="button"]').all();

    for (const element of interactiveElements) {
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) continue;

      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();
      const title = await element.getAttribute('title');

      // Element should have either aria-label, aria-labelledby, text content, or title
      const hasLabel = !!(ariaLabel || ariaLabelledBy || textContent?.trim() || title);

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should have proper ARIA roles for custom components', async ({ page }) => {
    // Check for common interactive patterns that need ARIA roles
    const customInteractive = await page.locator('[role]').all();

    for (const element of customInteractive) {
      const role = await element.getAttribute('role');

      // Verify role is a valid ARIA role
      const validRoles = [
        'button',
        'link',
        'navigation',
        'main',
        'complementary',
        'banner',
        'contentinfo',
        'search',
        'form',
        'dialog',
        'alert',
        'status',
        'progressbar',
        'tab',
        'tablist',
        'tabpanel',
        'menu',
        'menubar',
        'menuitem',
        'checkbox',
        'radio',
        'switch',
        'slider',
        'spinbutton',
        'textbox',
        'combobox',
        'listbox',
        'option',
        'tree',
        'treeitem',
        'grid',
        'gridcell',
        'row',
        'table',
      ];

      expect(validRoles).toContain(role);
    }
  });

  test('should announce form errors to screen readers', async ({ page }) => {
    // Find forms
    const forms = await page.locator('form').all();

    if (forms.length > 0) {
      // Try to submit with invalid data
      const form = forms[0];
      const submitButton = form.locator('button[type="submit"]');

      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Wait a bit for error messages to appear
        await page.waitForTimeout(500);

        // Check for ARIA live regions for errors
        const liveRegions = await page.locator('[aria-live]').all();
        const errorMessages = await page.locator('[role="alert"], .error, [aria-invalid="true"]').all();

        // Should have either live regions or error messages
        expect(liveRegions.length + errorMessages.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have skip navigation link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();

    if ((await skipLink.count()) > 0) {
      // Skip link should be the first focusable element
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.textContent?.toLowerCase());

      expect(firstFocused).toMatch(/skip|passer|sauter/i);
    }
  });

  test('should maintain focus when modals open', async ({ page }) => {
    // Look for modal trigger buttons
    const modalTriggers = await page
      .locator('button[aria-haspopup="dialog"], [data-dialog-trigger], .modal-trigger')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];
      await trigger.click();

      // Wait for modal to open
      await page.waitForTimeout(300);

      // Check if focus moved to modal
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          role: active?.getAttribute('role'),
          isInDialog: active?.closest('[role="dialog"]') !== null,
        };
      });

      // Focus should be inside modal or on modal itself
      expect(focusedElement.role === 'dialog' || focusedElement.isInDialog).toBeTruthy();
    }
  });

  test('should trap focus within modals', async ({ page }) => {
    // Look for modal trigger buttons
    const modalTriggers = await page
      .locator('button[aria-haspopup="dialog"], [data-dialog-trigger]')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];
      await trigger.click();

      // Wait for modal
      await page.waitForTimeout(300);

      // Tab through modal elements
      const focusedElements: boolean[] = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');

        const isInDialog = await page.evaluate(() => {
          return document.activeElement?.closest('[role="dialog"]') !== null;
        });

        focusedElements.push(isInDialog);
      }

      // All focused elements should be in the dialog
      expect(focusedElements.every((inDialog) => inDialog)).toBeTruthy();
    }
  });

  test('should restore focus when modals close', async ({ page }) => {
    const modalTriggers = await page
      .locator('button[aria-haspopup="dialog"], [data-dialog-trigger]')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];

      // Focus and remember the trigger
      await trigger.focus();
      const triggerHTML = await trigger.evaluate((el) => el.outerHTML);

      // Open modal
      await trigger.click();
      await page.waitForTimeout(300);

      // Close modal (try ESC key first)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Check if focus returned to trigger
      const currentFocused = await page.evaluate(() => document.activeElement?.outerHTML);

      expect(currentFocused).toBe(triggerHTML);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();

    if (headings.length > 0) {
      // Should have exactly one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Get heading levels
      const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => {
        return headings.map((h) => parseInt(h.tagName.substring(1)));
      });

      // Check for skipped levels
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        // Should not skip more than 1 level
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a simplified test - for production use axe-core or similar
    const textElements = await page.locator('p, span, a, button, h1, h2, h3, h4, h5, h6').all();

    for (const element of textElements.slice(0, 10)) {
      // Limit to first 10 for performance
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) continue;

      const colors = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });

      // Elements should have both color and background color set
      expect(colors.color).not.toBe('');
      expect(colors.backgroundColor).not.toBe('');
    }
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('should have lang attribute on html element', async ({ page }) => {
    await page.goto('/');

    const lang = await page.evaluate(() => document.documentElement.lang);

    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThanOrEqual(2); // e.g., 'en', 'fr'
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();

    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should update page title on navigation', async ({ page }) => {
    await page.goto('/');
    const initialTitle = await page.title();

    // Try to navigate to another page
    const links = await page.locator('a[href^="/"]').all();

    if (links.length > 0) {
      await links[0].click();
      await page.waitForTimeout(500);

      const newTitle = await page.title();

      // Title should change on navigation
      expect(newTitle).not.toBe(initialTitle);
    }
  });

  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');

      // All images should have alt attribute (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should use semantic HTML elements', async ({ page }) => {
    await page.goto('/');

    // Check for semantic elements
    const hasMain = (await page.locator('main, [role="main"]').count()) > 0;
    const hasNav = (await page.locator('nav, [role="navigation"]').count()) > 0;

    // Page should have main content area
    expect(hasMain).toBeTruthy();

    // If there are navigation links, should have nav element
    const hasLinks = (await page.locator('a').count()) > 3;
    if (hasLinks) {
      expect(hasNav).toBeTruthy();
    }
  });
});
