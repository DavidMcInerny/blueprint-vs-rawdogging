export async function inspectBrandHome(page, brand) {
  const title = page.getByTestId('app-title');
  const titleCount = await title.count();
  const titleText = titleCount === 1 ? (await title.textContent())?.trim() : null;
  const demoLinks = await page.locator('a[href]').evaluateAll((links) => links.map((link) => new URL(link.href).pathname).filter((pathname) => /^\/(?:explore|modal|notes?)(?:\/|$)/.test(pathname)));
  return { titleCount, titleText, demoLinks, pass: titleCount === 1 && titleText === brand.name && demoLinks.length === 0 };
}

// Intentionally uses real sequential keyboard navigation. Programmatic focus
// would incorrectly admit tabIndex=-1 controls.
export async function tabTo(page, target, maxTabs = 60) {
  if (await target.count() !== 1) return false;
  for (let n = 0; n < maxTabs; n++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((node) => node === document.activeElement)) return true;
  }
  return false;
}

export async function activateFocusedFilter(page, target) {
  if (!await target.evaluate((node) => node === document.activeElement)) throw new Error('Filter must be reached by Tab before activation.');
  const space = await target.evaluate((node) => ['checkbox', 'radio'].includes(node.getAttribute('role') ?? node.getAttribute('type')));
  await page.keyboard.press(space ? 'Space' : 'Enter');
}

export function visibleItemsMatch(rowTexts, expectedTitles) {
  if (rowTexts.length !== expectedTitles.length) return false;
  const seen = new Set();
  for (const text of rowTexts) {
    const matches = expectedTitles.filter((title) => text.includes(title));
    if (matches.length !== 1 || seen.has(matches[0])) return false;
    seen.add(matches[0]);
  }
  return seen.size === expectedTitles.length;
}
