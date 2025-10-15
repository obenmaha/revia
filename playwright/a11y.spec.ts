import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests for NFR6 Compliance
 *
 * Tests focus management, keyboard navigation, and color contrast
 * to ensure WCAG 2.1 AA compliance
 */

/**
 * Calculate relative luminance from RGB values
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse rgb/rgba color string to RGB values
 */
function parseRgbColor(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

test.describe('Accessibility - Focus Management (NFR6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have visible focus indicators on all interactive elements', async ({ page }) => {
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
        const isVisible = await element.isVisible().catch(() => false);
        if (!isVisible) continue;

        await element.focus().catch(() => {});

        const isFocused = await element.evaluate((el) => el === document.activeElement);

        if (isFocused) {
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

  test('should maintain focus when modals open', async ({ page }) => {
    const modalTriggers = await page
      .locator('button[aria-haspopup="dialog"], [data-dialog-trigger], .modal-trigger')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];
      await trigger.click();

      await page.waitForTimeout(300);

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

  test('should restore focus when modals close', async ({ page }) => {
    const modalTriggers = await page
      .locator('button[aria-haspopup="dialog"], [data-dialog-trigger]')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];

      await trigger.focus();
      const triggerHTML = await trigger.evaluate((el) => el.outerHTML);

      await trigger.click();
      await page.waitForTimeout(300);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const currentFocused = await page.evaluate(() => document.activeElement?.outerHTML);

      expect(currentFocused).toBe(triggerHTML);
    }
  });
});

test.describe('Accessibility - Color Contrast (NFR6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have sufficient color contrast for text elements (WCAG AA 4.5:1)', async ({
    page,
  }) => {
    const textElements = await page
      .locator('p, span, a, button, h1, h2, h3, h4, h5, h6, label, li')
      .all();

    const failures: Array<{ selector: string; ratio: number; text: string }> = [];

    for (const element of textElements.slice(0, 20)) {
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) continue;

      const textContent = await element.textContent();
      if (!textContent?.trim()) continue;

      const contrastData = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const color = computed.color;
        const backgroundColor = computed.backgroundColor;
        const fontSize = computed.fontSize;

        // Get selector for reporting
        const selector = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''}`;

        return {
          color,
          backgroundColor,
          fontSize: parseFloat(fontSize),
          selector,
        };
      });

      const fgColor = parseRgbColor(contrastData.color);
      let bgColor = parseRgbColor(contrastData.backgroundColor);

      // If background is transparent, try to get parent background
      if (bgColor && bgColor.a === 0) {
        bgColor = await element.evaluate((el) => {
          let parent = el.parentElement;
          while (parent) {
            const bg = window.getComputedStyle(parent).backgroundColor;
            const parsed = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (parsed) {
              const alpha = parsed[4] ? parseFloat(parsed[4]) : 1;
              if (alpha > 0) {
                return bg;
              }
            }
            parent = parent.parentElement;
          }
          return 'rgb(255, 255, 255)'; // Default to white
        }).then(parseRgbColor);
      }

      if (!fgColor || !bgColor) continue;

      const fgLuminance = calculateLuminance(fgColor.r, fgColor.g, fgColor.b);
      const bgLuminance = calculateLuminance(bgColor.r, bgColor.g, bgColor.b);
      const contrastRatio = calculateContrastRatio(fgLuminance, bgLuminance);

      // WCAG AA: 4.5:1 for normal text, 3:1 for large text (18pt or 14pt bold)
      const isLargeText = contrastData.fontSize >= 18 || contrastData.fontSize >= 14;
      const requiredRatio = isLargeText ? 3 : 4.5;

      if (contrastRatio < requiredRatio) {
        failures.push({
          selector: contrastData.selector,
          ratio: Math.round(contrastRatio * 100) / 100,
          text: textContent.slice(0, 50),
        });
      }
    }

    if (failures.length > 0) {
      console.log('Contrast failures:', failures);
    }

    expect(failures.length).toBe(0);
  });

  test('should have sufficient contrast for interactive elements in focus state', async ({
    page,
  }) => {
    const interactiveElements = await page.locator('button, a, input, select').all();

    const failures: Array<{ selector: string; ratio: number }> = [];

    for (const element of interactiveElements.slice(0, 10)) {
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) continue;

      await element.focus().catch(() => {});

      const isFocused = await element.evaluate((el) => el === document.activeElement);
      if (!isFocused) continue;

      const contrastData = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);

        // Check outline color contrast
        const outlineColor = computed.outlineColor;
        const backgroundColor = computed.backgroundColor;

        const selector = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;

        return {
          outlineColor,
          backgroundColor,
          selector,
        };
      });

      const outlineColor = parseRgbColor(contrastData.outlineColor);
      const bgColor = parseRgbColor(contrastData.backgroundColor);

      if (!outlineColor || !bgColor) continue;

      const outlineLuminance = calculateLuminance(outlineColor.r, outlineColor.g, outlineColor.b);
      const bgLuminance = calculateLuminance(bgColor.r, bgColor.g, bgColor.b);
      const contrastRatio = calculateContrastRatio(outlineLuminance, bgLuminance);

      // Focus indicators should have at least 3:1 contrast
      if (contrastRatio < 3) {
        failures.push({
          selector: contrastData.selector,
          ratio: Math.round(contrastRatio * 100) / 100,
        });
      }
    }

    if (failures.length > 0) {
      console.log('Focus contrast failures:', failures);
    }

    expect(failures.length).toBe(0);
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
});

test.describe('Accessibility - Screen Reader Support (NFR6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have lang attribute on html element', async ({ page }) => {
    const lang = await page.evaluate(() => document.documentElement.lang);

    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThanOrEqual(2);
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();

    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have alt text on all images', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');

      // All images should have alt attribute (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should use semantic HTML elements', async ({ page }) => {
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
