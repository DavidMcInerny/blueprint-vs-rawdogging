import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import React from 'react';
import { act, create } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../starters/expo/src/', import.meta.url));
const brand = JSON.parse(readFileSync(new URL('../starters/expo/brand.json', import.meta.url), 'utf8'));
const h = React.createElement;

// Load the actual Screen and metadata with Metro's platform suffix precedence.
// Native UI/router contexts are host stubs; Head must never even load on native.
function screenFor(platform, settings = {}) {
  const cache = new Map();
  let headImports = 0;
  let headRenders = 0;
  const env = { name: 'production', siteUrl: 'https://gather.example', ...settings.env };
  const theme = { dark: false, reducedMotion: true, ...settings.theme };
  class Value { stopAnimation() {} setValue() {} }
  const mocks = {
    'react-native': {
      Platform: { OS: platform }, View: 'View',
      Animated: { Value, View: 'AnimatedView', timing: () => ({ start() {} }) },
    },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 24 }) },
    'expo-router': { useSegments: () => settings.segments ?? [] },
    '@/theme/ThemeProvider': { useTheme: () => theme },
    '@/config/app': { brand },
    '@/config/env': { env },
    '@/foundation/blueprint-shell/components/product-ui': {
      ScreenScaffold: ({ header, children, ...props }) => h('Scaffold', props, header, children),
      ScreenHeader: props => h('Header', props),
    },
  };
  function load(path) {
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    function localRequire(id) {
      if (id === 'expo-router/head') {
        headImports++;
        assert.equal(platform, 'web', 'native screens must not import Expo Head/Handoff');
        return { __esModule: true, default: ({ children }) => { headRenders++; return h(React.Fragment, null, children); } };
      }
      if (id in mocks) return mocks[id];
      if (id.startsWith('.')) {
        const base = resolve(dirname(path), id);
        const suffixes = platform === 'web' ? ['.web', ''] : [`.${platform}`, '.native', ''];
        const target = suffixes.flatMap(suffix => ['.tsx', '.ts'].map(ext => base + suffix + ext)).find(existsSync);
        assert.ok(target, `Missing screen import ${id}`);
        return load(target);
      }
      return require(id);
    }
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: path })(localRequire, module, module.exports);
    return module.exports;
  }
  return { ...load(resolve(root, 'components/ui/Screen.tsx')), env, theme, headImports: () => headImports, headRenders: () => headRenders };
}

async function mount(t, Screen, props) {
  let view;
  await act(async () => { view = create(h(Screen, props, h('Content', null, 'Capture a thought'))); });
  t.after(async () => { await act(async () => view.unmount()); });
  return view;
}
const meta = (view, name) => view.root.findByProps({ name }).props.content;

for (const platform of ['ios', 'android']) {
  test(`${platform} Screen renders its content without importing or invoking Expo Head`, async t => {
    const loaded = screenFor(platform);
    const view = await mount(t, loaded.Screen, { title: 'Capture', description: 'Write a note', publicPath: '/help' });
    assert.equal(loaded.headImports(), 0);
    assert.equal(loaded.headRenders(), 0);
    assert.equal(view.root.findByType('Content').children[0], 'Capture a thought');
    assert.equal(view.root.findByType('Header').props.title, 'Capture');
    assert.equal(view.root.findByType('Header').props.description, 'Write a note');
    assert.equal(view.root.findByType('View').props.role, 'main');
    assert.equal(view.root.findByType('Scaffold').props.insets.bottom, 24);
  });
}

test('web Screen keeps branded metadata, public canonical/index policy and theme updates', async t => {
  const loaded = screenFor('web', { segments: ['(tabs)'] });
  const view = await mount(t, loaded.Screen, { title: 'Help', description: 'Public help', publicPath: '/help' });
  assert.equal(loaded.headImports(), 1);
  assert.equal(loaded.headRenders(), 1);
  assert.equal(view.root.findByType('title').children.join(''), `Help · ${brand.name}`);
  assert.equal(meta(view, 'description'), 'Public help');
  assert.equal(meta(view, 'robots'), 'index,follow');
  assert.equal(meta(view, 'theme-color'), brand.light.background);
  assert.equal(view.root.findByProps({ rel: 'canonical' }).props.href, 'https://gather.example/help');
  assert.equal(view.root.findByType('View').props.role, undefined);
  loaded.theme.dark = true;
  await act(async () => view.update(h(loaded.Screen, { title: 'Account' }, h('Content'))));
  assert.equal(view.root.findByType('title').children.join(''), `Account · ${brand.name}`);
  assert.equal(meta(view, 'description'), brand.description);
  assert.equal(meta(view, 'robots'), 'noindex,nofollow');
  assert.equal(meta(view, 'theme-color'), brand.dark.background);
  assert.equal(view.root.findAllByProps({ rel: 'canonical' }).length, 0);
});

for (const env of [
  { name: 'development' }, { name: 'preview' }, { siteUrl: undefined },
]) {
  test(`web public metadata remains noindex for ${JSON.stringify(env)}`, async t => {
    const loaded = screenFor('web', { env });
    const view = await mount(t, loaded.Screen, { title: 'Help', publicPath: '/help' });
    assert.equal(meta(view, 'robots'), 'noindex,nofollow');
    assert.equal(view.root.findAllByProps({ rel: 'canonical' }).length, env.siteUrl === undefined && 'siteUrl' in env ? 0 : 1);
  });
}
