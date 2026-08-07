import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/server';
import { registerConfigTools } from '../../src/tools/config.js';
import type { ToolContext, ToolResult } from '../../src/tools/registry.js';
import type { KeeneticClient } from '../../src/router/client.js';
import { stubBackup } from '../helpers/backup.js';

type Handler = (args: Record<string, unknown>) => Promise<ToolResult>;

const RUNNING_CHECKSUM = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const STALE_CHECKSUM = '0f9e8d7c6b5a49382716f5e4d3c2b1a0';

/** Startup config as the router serves it: the saved checksum is in the header. */
const configText = (checksum: string) =>
  `! $$$ Md5 checksum: ${checksum}\n! $$$ Model: Keenetic Model\nip hotspot\n`;

const CONFIG = configText(STALE_CHECKSUM);

/**
 * `unsavedAfter` models a save that never completes: the command is accepted
 * but the checksum in flash never catches up with the running one.
 *
 * `fail-safe.unsaved` is deliberately pinned to false throughout, because that
 * is what a real 5.1.1 router reports even while a change sits unsaved. A save
 * check that believes that flag passes this harness while doing nothing.
 */
function harness(opts: { unsavedAfter?: boolean; readOnly?: boolean } = {}) {
  const posts: unknown[] = [];
  let savedChecksum = STALE_CHECKSUM;

  const client = {
    rci: {
      get: vi.fn(async () => ({
        date: 'Fri, 7 Aug 2026 01:20:36 GMT',
        user: 'admin',
        checksum: RUNNING_CHECKSUM,
        'fail-safe': { unsaved: false, rollback: false, 'time-left': 0 }
      })),
      post: vi.fn(async (body: unknown) => {
        posts.push(body);
        if (opts.unsavedAfter !== true) savedChecksum = RUNNING_CHECKSUM;
        return {};
      }),
      getText: vi.fn(async () => configText(savedChecksum))
    },
    capabilities: vi.fn()
  } as unknown as KeeneticClient;

  const ctx: ToolContext = {
    client,
    maxResponseBytes: 25_000,
    readOnly: opts.readOnly === true,
    backup: stubBackup()
  };
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  const handlers: Record<string, Handler> = {};
  vi.spyOn(server, 'registerTool').mockImplementation(((
    name: string,
    _c: unknown,
    handler: Handler
  ) => {
    handlers[name] = handler;
    return {} as never;
  }) as never);

  registerConfigTools(server, ctx);
  return { handlers, posts };
}

function payload(result: ToolResult): any {
  return JSON.parse(result.content.map(p => p.text).join(''));
}

describe('save_config', () => {
  it('sends the save command and confirms afterwards', async () => {
    const { handlers, posts } = harness();
    const out = payload(await handlers['save_config']!({}));
    expect(posts).toContainEqual({ system: { configuration: { save: {} } } });
    expect(out.saved).toBe(true);
  });

  it('fails when the router still reports unsaved changes', async () => {
    const { handlers } = harness({ unsavedAfter: true });
    const result = await handlers['save_config']!({});
    expect(result.isError).toBe(true);
    expect(result.content.map(p => p.text).join('')).toMatch(/still reports unsaved/i);
  }, 10_000);

  it('is not registered in read-only mode', () => {
    const { handlers } = harness({ readOnly: true });
    expect(handlers['save_config']).toBeUndefined();
  });
});

describe('backup_config', () => {
  it('writes the startup config to the requested path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kn-'));
    const target = join(dir, 'out.txt');
    const { handlers } = harness();
    const out = payload(await handlers['backup_config']!({ path: target }));

    expect(out.path).toBe(target);
    expect(out.bytes).toBe(CONFIG.length);
    await expect(readFile(target, 'utf8')).resolves.toBe(CONFIG);
  });

  it('reports a usable error when the directory does not exist', async () => {
    const { handlers } = harness();
    const result = await handlers['backup_config']!({ path: '/nope/missing/out.txt' });
    expect(result.isError).toBe(true);
    expect(result.content.map(p => p.text).join('')).toMatch(/absolute path/i);
  });

  it('stays available in read-only mode, since reading changes nothing', () => {
    const { handlers } = harness({ readOnly: true });
    expect(handlers['backup_config']).toBeDefined();
  });
});
