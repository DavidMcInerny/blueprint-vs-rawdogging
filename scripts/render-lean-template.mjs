import { lstat, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Render an exclusively-created copy, never the canonical runnable reference.
// Exact substitutions fail on reference drift instead of leaving demo wiring.
export async function renderLeanTemplate(target, { withDemo = false, agent = 'both' } = {}) {
  if (withDemo) return;
  target = await realpath(target);
  const canonical = await realpath(fileURLToPath(new URL('../starters/expo', import.meta.url)));
  if (target === canonical || canonical.startsWith(target + path.sep)) throw new Error('Refusing to render the canonical reference.');
  const file = (name) => path.join(target, name);
  async function replace(name, before, after) {
    const source = await readFile(file(name), 'utf8');
    if (!source.includes(before)) throw new Error(`Lean template source drift: ${name}`);
    await writeFile(file(name), source.replace(before, after));
  }
  for (const name of ['src/modules/notes', 'src/app/note', 'src/app/(tabs)/notes.tsx', 'e2e/notes.spec.ts']) {
    if ((await lstat(file(name))).isSymbolicLink()) throw new Error(`Refusing demo symlink: ${name}`);
    await rm(file(name), { recursive: true });
  }
  await replace('src/modules/app-shell/RootLayout.tsx', "import { NotesProvider } from '@/modules/notes';\n", '');
  await replace('src/modules/app-shell/RootLayout.tsx', '      <NotesProvider>\n        <RootNavigation />\n      </NotesProvider>', '      <RootNavigation />');
  await replace('src/modules/navigation/screens.tsx', '        <Stack.Screen name="note/new" options={{ title: \'New note\' }} />\n        <Stack.Screen name="note/index" options={{ title: \'Your note\' }} />\n', '');
  await replace('src/modules/navigation/screens.tsx', "  const activeKey =\n    pathname === '/settings' ? 'settings' : pathname === '/notes' ? 'notes' : 'home';", "  const activeKey = pathname === '/settings' ? 'settings' : 'home';");
  await replace('src/modules/navigation/screens.tsx', "  const destinations = { home: '/', notes: '/notes', settings: '/settings' } as const;", "  const destinations = { home: '/', settings: '/settings' } as const;");
  await replace('src/modules/navigation/screens.tsx', `        {
          key: 'notes',
          label: navigation.notes,
          icon: <Feather accessible={false} name="file-text" color={colors.accent} size={22} />,
        },
`, '');
  await replace('src/modules/navigation/screens.tsx', "        if (key === 'home' || key === 'notes' || key === 'settings')\n          router.navigate(destinations[key]);", "        if (key === 'home' || key === 'settings') router.navigate(destinations[key]);");
  await replace('src/modules/navigation/screens.tsx', '        <Tabs.Screen name="notes" options={{ title: navigation.notes }} />\n', '');
  await writeFile(file('src/config/navigation.ts'), "export const navigation = { home: 'Home', settings: 'Settings' } as const;\n");
  await writeFile(file('src/modules/home/screens.tsx'), `import { brand } from '@/config/app';
import { Card, Screen, Text } from '@/components/ui';
export function HomeScreen() {
  return (
    <Screen title={brand.name} description={brand.description}>
      <Card>
        <Text variant="heading">{brand.welcome}</Text>
        <Text>{brand.subtitle}</Text>
      </Card>
    </Screen>
  );
}
`);
  await writeFile(file('src/modules/support/screens.tsx'), `import { Linking } from 'react-native';
import { brand } from '@/config/app';
import { Button, Card, Screen, Text } from '@/components/ui';
export function SupportScreen() {
  return (
    <Screen title="Help & information" description={brand.description} publicPath="/support">
      <Card>
        <Text variant="heading">About this app</Text>
        <Text>Appearance and motion preferences are stored on this device.</Text>
        <Text>
          Review this information and add your product’s support and privacy details before release.
        </Text>
        {brand.supportEmail ? (
          <Button
            label="Contact support"
            onPress={() => {
              void Linking.openURL('mailto:' + brand.supportEmail);
            }}
          />
        ) : null}
      </Card>
    </Screen>
  );
}
`);
  await replace('src/modules/settings/screens.tsx', `          Notes stay on this device or browser. There is no account or cloud backup. Clearing app or
          browser storage removes them.`, `          Appearance and motion preferences stay on this device or browser. Clearing app or browser
          storage removes these preferences.`);
  const brand = JSON.parse(await readFile(file('brand.json'), 'utf8'));
  Object.assign(brand, { description: 'Your application.', welcome: 'Welcome.', subtitle: 'Build your first useful workflow here.' });
  await writeFile(file('brand.json'), JSON.stringify(brand, null, 2) + '\n');
  await writeFile(file('e2e/native/smoke.yaml'), `appId: \${APP_ID}
---
- launchApp:
    clearState: true
- tapOn: "Settings"
- tapOn: "Dark"
- stopApp
- launchApp
- tapOn: "Settings"
- assertVisible: "Appearance"
`);
  const instructions = `# Product instructions

Read BLUEPRINT.md and docs/project-index.md. Preserve existing user changes.
Keep routes in src/app as re-exports, product behavior in src/modules with index.ts APIs,
and external adapters in src/services. Brand/config/theme belong to this app.
Select optional capabilities from the product brief; reference examples are not a backlog.
Use the separately installed Blueprint skills for detailed workflows; see docs/verification.md.
Run npm run check for affected code, build:web then test:e2e for web behavior.
Record actual results and remaining device/provider/release checks; never claim unrun checks.
`;
  for (const flavor of agent === 'both' ? ['codex', 'claude'] : [agent]) {
    const name = flavor === 'codex' ? 'AGENTS.md' : 'CLAUDE.md';
    await writeFile(file(name), instructions);
    for (const layer of ['modules', 'services']) await writeFile(file('src/' + layer + '/' + name), `# ${layer}\n\nFollow the root instructions. Keep explicit public APIs and typed boundaries; preserve useful state on failure.\n`);
  }
  await writeFile(file('BLUEPRINT.md'), `# Product foundation

Use TypeScript, Expo Router and React Native for iOS, Android and web.
Keep the product’s routes, brand, theme, business rules and provider adapters app-owned.
Preserve state during recoverable failures, expose truthful saving/error/retry states,
and support accessible controls, reduced motion and narrow layouts.
No account, backend, analytics or demo workflow is selected by this starter.
Record product scope and verification in docs/project-index.md and docs/app-quality-contract.md.
The full shared methodology is delivered separately through Blueprint skills.
`);
  await writeFile(file('README.md'), `# Your application

Run npm ci, npm run assets, then npm run web or npm start.
This app contains the shared shell and persisted appearance/motion preferences.
Implement your first workflow in src/modules; map it through thin src/app routes.
Edit brand.json, src/config and src/theme for this product.
See docs/verification.md for checks and docs/release.md for native delivery.
The notes workflow and optional capabilities remain runnable in Blueprint’s reference app,
and can be selected deliberately; they are absent from this product.
`);
  await writeFile(file('docs/project-index.md'), `# Project index

Status: new product; first useful workflow and release evidence pending.
- Stack: TypeScript, Expo SDK 57 / Expo Router, React Native; iOS, Android and static web.
- Product routes: Home, Settings and Support. Add your actual workflow under src/modules.
- Brand: brand.json; fonts: src/config/fonts.ts; theme: src/theme.
- Data: appearance/motion preferences only, device-local; no accounts or remote services.
- Architecture: docs/architecture.md. Quality: docs/app-quality-contract.md.
- Commands and evidence: docs/verification.md. Origin: blueprint-version.json.
`);
  await writeFile(file('docs/architecture.md'), `# Product architecture

Thin src/app routes re-export src/modules public APIs. The root composes safe areas,
theme persistence and shared navigation. src/foundation/blueprint-shell is the checked
copy of canonical shell source; product adapters and policy stay outside that directory.
Brand/config/theme and Home/Settings/Support are owned by this product.
Appearance/motion preferences use typed device storage. Failed reads preserve bytes,
block edits and expose retry; acknowledged settings follow durable writes.
Web uses a static export; only configured production Support may be indexed.
Native release identity and OTA/device verification remain app-owned.
`);
  await writeFile(file('docs/app-quality-contract.md'), `# Product quality contract

Inherited shell: accessible navigation, persisted appearance/motion preferences,
failure/retry without resetting storage, shared controls, static-web metadata and budgets.
Checks: npm run check; npm run build:web; npm run test:e2e; npm run export:native.
Web shell tests cover settings persistence/corruption, keyboard, axe, overflow and 404.
Native bundles do not establish device, assistive-technology or signed-release acceptance.

Complete before product delivery:
- Intended users, first useful workflow, non-goals and supported platforms:
- Product data authority, failure/recovery and selected provider contracts:
- Numeric budgets in budgets.json and representative workload:
- Public routes, privacy/support copy and environment/account owners:
- Actual executed evidence and remaining device/provider/release checks:
`);
  await writeFile(file('docs/verification.md'), `# Verification

This new app inherits source and checks, not a claim that those checks have run here.

1. Run npm ci and npm run assets.
2. Run npm run check (types, lint, formatting, boundaries, accessibility, assets and unit contracts).
3. Run npm run build:web, install Chromium with npx playwright install chromium,
   then npm run test:e2e for navigation, preference persistence/recovery and web accessibility.
4. Run npm run doctor and npm run export:native when targeting native.
5. Record commit, commands, results and applicable device/provider/release evidence here.

The reference app’s notes tests stay with its notes module. Add product workflow tests
alongside your implementation. Check narrow layouts, both themes and actual assistive
technology; web automation and portable bundles do not prove a signed native release.
See docs/release.md for app identity, environment, signed build and OTA responsibilities.

Blueprint’s reusable skills/playbooks are installed once outside the product.
From a Blueprint checkout, run node plugin/build.mjs --target <new-plugin-folder> and
follow plugin/README.md. Source recipes use the existing scaffold/sync commands documented
in Blueprint registry/README.md. Select only capabilities required by this product.
`);
}
