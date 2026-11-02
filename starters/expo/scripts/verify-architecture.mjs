import { readdir, readFile, lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, relative, resolve, sep, posix } from "node:path";
import { pathToFileURL } from "node:url";
import { architecturePolicy as policy } from "./quality-config.mjs";

const sourceFile = (name) =>
  /\.[cm]?[jt]sx?$/.test(name) && !/\.d\.[cm]?ts$/.test(name);
const testFile = (name) =>
  /(?:^|\/)__tests__\/|\.(?:test|spec)\.[cm]?[jt]sx?$/.test(name);
const moduleOf = (name) => name.match(/^src\/modules\/([^/]+)\//)?.[1];

/** Single rule set for both real-project and in-memory checks. */
export function auditSources(files, ts, { resolveImport } = {}) {
  const issues = [];
  const graph = new Map();
  const names = Object.keys(files).filter(
    (name) => sourceFile(name) && !testFile(name),
  );
  function localTarget(specifier, name) {
    const base = specifier.startsWith("@/")
      ? "src/" + specifier.slice(2)
      : specifier.startsWith(".")
        ? posix.normalize(posix.join(posix.dirname(name), specifier))
        : undefined;
    if (!base) return undefined;
    return [
      base,
      base + ".ts",
      base + ".tsx",
      base + "/index.ts",
      base + "/index.tsx",
      base.replace(/\.[cm]?jsx?$/, ".ts"),
      base.replace(/\.[cm]?jsx?$/, ".tsx"),
    ].find((candidate) => files[candidate] !== undefined);
  }
  for (const name of names) {
    const source = ts.createSourceFile(
      name,
      files[name],
      ts.ScriptTarget.Latest,
      true,
    );
    graph.set(name, []);
    const report = (node, message) =>
      issues.push(
        name +
          ":" +
          (source.getLineAndCharacterOfPosition(node.getStart(source)).line +
            1) +
          ": " +
          message,
      );
    function checkImport(node, specifier, runtime = true) {
      const target = resolveImport
        ? resolveImport(specifier, name)
        : localTarget(specifier, name);
      if (!target) {
        if (specifier.startsWith(".") || specifier.startsWith("@/"))
          report(node, "Unresolved local import: " + specifier);
        return;
      }
      const targetModule = moduleOf(target);
      if (
        targetModule &&
        moduleOf(name) !== targetModule &&
        target !== "src/modules/" + targetModule + "/index.ts"
      )
        report(
          node,
          "Cross-module imports must use the public index.ts (public module API)",
        );
      const layer = name.split("/")[1];
      const targetLayer = target.split("/")[1];
      if (
        policy.foundationalLayers.includes(layer) &&
        ["modules", "services", "state"].includes(targetLayer)
      )
        report(
          node,
          "Foundation/config cannot depend on application implementation",
        );
      if (policy.sharedLayers.includes(layer) && targetLayer === "modules")
        report(node, "Shared foundation depends on a product module");
      if (
        name.startsWith("src/app/") &&
        targetLayer === "services" &&
        !basename(name).startsWith("_layout.")
      )
        report(node, "Route calls services directly");
      if (runtime && files[target] !== undefined && !testFile(target))
        graph.get(name).push({ target, node, report });
    }
    function visit(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        checkImport(
          node,
          node.moduleSpecifier.text,
          !(
            node.isTypeOnly ||
            node.importClause?.isTypeOnly ||
            (ts.isImportDeclaration(node) &&
              !node.importClause?.name &&
              ts.isNamedImports(node.importClause?.namedBindings ?? node) &&
              node.importClause.namedBindings.elements.length > 0 &&
              node.importClause.namedBindings.elements.every(
                (element) => element.isTypeOnly,
              )) ||
            (ts.isExportDeclaration(node) &&
              node.exportClause &&
              ts.isNamedExports(node.exportClause) &&
              node.exportClause.elements.length > 0 &&
              node.exportClause.elements.every((element) => element.isTypeOnly))
          ),
        );
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      ) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) checkImport(node, arg.text);
        else
          report(
            node,
            "Computed imports need an explicit static adapter boundary",
          );
      }
      const processEnv =
        (ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "process" &&
          node.name.text === "env") ||
        (ts.isElementAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "process" &&
          ts.isStringLiteral(node.argumentExpression) &&
          node.argumentExpression.text === "env");
      if (processEnv && name !== policy.environmentFile) {
        const parent = node.parent;
        const key =
          ts.isPropertyAccessExpression(parent) && parent.expression === node
            ? parent.name.text
            : ts.isElementAccessExpression(parent) &&
                parent.expression === node &&
                ts.isStringLiteral(parent.argumentExpression)
              ? parent.argumentExpression.text
              : undefined;
        if (!policy.compilerEnvironmentConstants.includes(key))
          report(
            node,
            "Environment access belongs in " + policy.environmentFile,
          );
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    if (
      name.startsWith("src/app/") &&
      !basename(name).startsWith("+") &&
      !/\+api\.[cm]?[jt]sx?$/.test(name)
    ) {
      for (const statement of source.statements) {
        const reexport =
          ts.isExportDeclaration(statement) &&
          statement.moduleSpecifier &&
          ts.isStringLiteral(statement.moduleSpecifier);
        const staticParams =
          ts.isFunctionDeclaration(statement) &&
          statement.name?.text === "generateStaticParams";
        const directive =
          ts.isExpressionStatement(statement) &&
          ts.isStringLiteral(statement.expression);
        const typeOnly =
          ts.isImportDeclaration(statement) &&
          statement.importClause?.isTypeOnly;
        if (!(reexport || staticParams || directive || typeOnly))
          report(
            statement,
            "Route implementation belongs in a module; use re-exports",
          );
      }
    }
  }
  const active = new Set(),
    visited = new Set();
  function walk(name) {
    if (visited.has(name)) return;
    active.add(name);
    for (const edge of graph.get(name) ?? []) {
      if (active.has(edge.target))
        edge.report(edge.node, "Import cycle: " + name + " -> " + edge.target);
      else walk(edge.target);
    }
    active.delete(name);
    visited.add(name);
  }
  for (const name of graph.keys()) walk(name);
  if (
    !names.some((name) => name.startsWith("src/app/")) ||
    !names.some((name) => name.startsWith("src/modules/"))
  )
    issues.push("src:1: No routes or modules scanned.");
  return issues;
}

/** Uses the adopting app's TypeScript and tsconfig aliases. */
export async function verifyArchitecture(root, ts) {
  root = resolve(root);
  const issues = [];
  const normalize = (path) => relative(root, path).split(sep).join("/");
  const files = {};
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, item.name);
      if (item.isSymbolicLink())
        issues.push(
          normalize(path) + ":1: source symlink requires explicit review",
        );
      else if (item.isDirectory()) await walk(path);
      else if (sourceFile(path) && !testFile(normalize(path)))
        files[normalize(path)] = await readFile(path, "utf8");
    }
  }
  await walk(resolve(root, "src"));
  const configPath = ts.findConfigFile(root, ts.sys.fileExists);
  if (!configPath) throw new Error("tsconfig.json is required");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    dirname(configPath),
  );
  for (const error of parsed.errors.filter((error) => error.code !== 18003))
    issues.push(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
  const moduleRoot = resolve(root, "src/modules");
  for (const entry of await readdir(moduleRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      if (!(await lstat(resolve(moduleRoot, entry.name, "index.ts"))).isFile())
        throw new Error();
    } catch {
      issues.push(
        "src/modules/" + entry.name + "/index.ts:1: missing public API",
      );
    }
  }
  const resolveImport = (specifier, name) => {
    const target = ts.resolveModuleName(
      specifier,
      resolve(root, name),
      parsed.options,
      ts.sys,
    ).resolvedModule?.resolvedFileName;
    return target ? normalize(target) : undefined;
  };
  return [...issues, ...auditSources(files, ts, { resolveImport })];
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(process.argv[2] ?? ".");
  try {
    const ts = createRequire(resolve(root, "package.json"))("typescript");
    const issues = await verifyArchitecture(root, ts);
    if (issues.length) throw new Error(issues.join("\n"));
    console.log(
      "Architecture checks passed. Router special files and runtime behavior still need review.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
