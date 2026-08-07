/**
 * Copies the version from package.json into every manifest that repeats it.
 *
 * package.json is the single source of truth. This runs from the `version`
 * npm lifecycle script, which fires after the bump and before npm creates the
 * release commit, so the rewritten manifests land in that same commit.
 *
 *   npm version minor     # bumps, syncs, commits, tags
 *
 * Run with --check to fail instead of writing, which is what CI wants.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);

type Json = Record<string, unknown>;

async function read(relative: string): Promise<Json> {
  return JSON.parse(await readFile(new URL(relative, ROOT), 'utf8')) as Json;
}

async function write(relative: string, value: Json): Promise<void> {
  await writeFile(new URL(relative, ROOT), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/** The range the plugins pin, which tracks the major and minor only. */
function pinFor(version: string): string {
  const [major, minor] = version.split('.');
  return `keenetic-mcp@^${major}.${minor}`;
}

interface Edit {
  file: string;
  describe: string;
  apply: (doc: Json, version: string) => boolean;
}

const EDITS: Edit[] = [
  {
    file: 'plugins/keenetic/.claude-plugin/plugin.json',
    describe: 'Claude plugin manifest',
    apply: (doc, version) => {
      if (doc['version'] === version) return false;
      doc['version'] = version;
      return true;
    }
  },
  {
    file: 'plugins/keenetic/.codex-plugin/plugin.json',
    describe: 'Codex plugin manifest',
    apply: (doc, version) => {
      if (doc['version'] === version) return false;
      doc['version'] = version;
      return true;
    }
  },
  {
    file: '.claude-plugin/marketplace.json',
    describe: 'Claude marketplace entry',
    apply: (doc, version) => {
      const plugins = doc['plugins'];
      if (!Array.isArray(plugins)) return false;
      let changed = false;
      for (const entry of plugins as Json[]) {
        if (entry['version'] !== version) {
          entry['version'] = version;
          changed = true;
        }
      }
      return changed;
    }
  },
  {
    file: 'plugins/keenetic/.mcp.json',
    describe: 'server pin used by both plugins',
    apply: (doc, version) => {
      const servers = doc['mcpServers'] as Json | undefined;
      const server = servers?.['keenetic'] as { args?: string[] } | undefined;
      if (!server?.args?.length) return false;
      const wanted = pinFor(version);
      if (server.args.at(-1) === wanted) return false;
      server.args[server.args.length - 1] = wanted;
      return true;
    }
  }
];

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const { version } = (await read('package.json')) as { version: string };

  const stale: string[] = [];
  for (const edit of EDITS) {
    const doc = await read(edit.file);
    if (!edit.apply(doc, version)) continue;

    if (check) {
      stale.push(`${edit.file} (${edit.describe})`);
      continue;
    }
    await write(edit.file, doc);
    process.stdout.write(`updated ${edit.file}\n`);
  }

  if (check && stale.length > 0) {
    process.stderr.write(
      `These do not match package.json ${version}:\n` +
        stale.map(s => `  ${s}\n`).join('') +
        'Run: npm run sync-versions\n'
    );
    process.exitCode = 1;
    return;
  }

  if (!check) process.stdout.write(`all manifests at ${version}\n`);
}

// Only run when executed, so the pin helper stays importable from tests.
const entry = process.argv[1];
if (entry !== undefined && fileURLToPath(import.meta.url) === entry) {
  await main();
}

export { pinFor };
