import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { checkStages, shellStages } from "./quality-config.mjs";

export function buildCheckPlan(scripts, withShell = false) {
  const plan = [...checkStages, ...(withShell ? shellStages : [])];
  for (const stage of plan) {
    if (stage.script && !scripts[stage.script] && !stage.optional)
      throw new Error(
        "package.json: required quality script is missing: " + stage.script,
      );
  }
  return plan.filter((stage) => !stage.optional || scripts[stage.script]);
}

/** Fail fast, retain native tool diagnostics (file/line), and measure real stages. */
export async function checkApp(
  root,
  { withShell = false, runner = spawnSync, log = console.log } = {},
) {
  root = resolve(root);
  const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const plan = buildCheckPlan(pkg.scripts ?? {}, withShell);
  const started = performance.now();
  for (const stage of plan) {
    log("\n[check] " + stage.name);
    const before = performance.now();
    // Under npm, use its actual CLI with Node; this also avoids .cmd shell quoting.
    const npmCli = process.env.npm_execpath;
    const command =
      stage.file || npmCli
        ? process.execPath
        : process.platform === "win32"
          ? "npm.cmd"
          : "npm";
    const args = stage.file
      ? [resolve(root, "scripts", stage.file)]
      : npmCli
        ? [npmCli, "run", stage.script]
        : ["run", stage.script];
    const result = runner(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: !stage.file && !npmCli && process.platform === "win32",
    });
    log(
      "[check] " +
        stage.name +
        ": " +
        ((performance.now() - before) / 1000).toFixed(2) +
        "s",
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      log(
        "[check] Failed: " +
          stage.name +
          (result.signal ? " (" + result.signal + ")" : ""),
      );
      return result.status || 1;
    }
  }
  log(
    "\n[check] Passed " +
      plan.length +
      " stages in " +
      ((performance.now() - started) / 1000).toFixed(2) +
      "s.",
  );
  return 0;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--with-shell") || args.length > 1)
      throw new Error("Usage: node scripts/check-app.mjs [--with-shell]");
    process.exitCode = await checkApp(".", {
      withShell: args.includes("--with-shell"),
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
