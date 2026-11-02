// The same tools and rule set score both conditions; app ESLint rules are ignored.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(new URL('../hidden/package.json', import.meta.url));
const ts = require('typescript');
const { ESLint } = require('eslint');
const parser = require('@typescript-eslint/parser');

export async function neutralQuality(appDir) {
  const configFile = path.join(appDir, 'tsconfig.json');
  const loaded = ts.readConfigFile(configFile, ts.sys.readFile);
  if (loaded.error) return { typeErrors: 1, lintErrors: null, diagnostics: [ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n')] };
  const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, appDir, {
    noEmit: true, noCheck: false, strict: true, noImplicitAny: true,
    noImplicitThis: true, strictNullChecks: true, strictFunctionTypes: true,
    strictBindCallApply: true, strictPropertyInitialization: true,
    strictBuiltinIteratorReturn: true, alwaysStrict: true, useUnknownInCatchVariables: true,
    noUncheckedIndexedAccess: false,
    noUnusedLocals: false, noUnusedParameters: false, skipLibCheck: true,
  }, configFile);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
  const typeErrors = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).length;
  const eslint = new ESLint({ cwd: appDir, overrideConfigFile: true, overrideConfig: [{
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { 'no-debugger': 'error', 'no-unreachable': 'error', 'no-constant-condition': ['error', { checkLoops: false }], 'constructor-super': 'error', 'valid-typeof': 'error', 'no-unsafe-finally': 'error' },
  }] });
  const lint = await eslint.lintFiles(parsed.fileNames.filter((file) => /\.[jt]sx?$/.test(file) && !file.endsWith('.d.ts')));
  return { typeErrors, lintErrors: lint.reduce((n, file) => n + file.errorCount, 0), lintWarnings: lint.reduce((n, file) => n + file.warningCount, 0),
    diagnostics: diagnostics.slice(0, 30).map((d) => ({ code: d.code, file: d.file ? path.relative(appDir, d.file.fileName) : undefined, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') })),
    lintMessages: lint.filter((f) => f.messages.length).map((f) => ({ file: path.relative(appDir, f.filePath), messages: f.messages })),
    tools: { typescript: ts.version, eslint: require('eslint/package.json').version, parser: require('@typescript-eslint/parser/package.json').version },
  };
}
