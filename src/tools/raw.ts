import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { fail, guard, ok, type ToolContext, type ToolResult } from './registry.js';

export function registerRawTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'rci_call',
    {
      title: 'Call the router API directly',
      description:
        'Sends a raw request to the router RCI interface, for anything the other tools do ' +
        'not cover. GET reads a path such as "show/version" or "interface/Bridge0"; POST ' +
        'sends a command object mirroring the CLI tree. The response is capped, so ask for ' +
        'a narrow path rather than a broad one: show/ip/nat alone is over 100 KB.',
      inputSchema: {
        method: z.enum(['GET', 'POST']).describe('GET reads, POST executes a command.'),
        path: z
          .string()
          .optional()
          .describe('Path after /rci/, for GET. Example: show/interface/Bridge0'),
        body: z.unknown().optional().describe('Command object for POST, mirroring the CLI tree.'),
        max_bytes: z
          .number()
          .int()
          .min(200)
          .optional()
          .describe('Lower the response ceiling for this call. It can never raise it.')
      },
      // In read-only mode POST is refused, so the tool genuinely cannot modify
      // anything and the annotation says so rather than overstating the risk.
      annotations: ctx.readOnly
        ? { readOnlyHint: true, openWorldHint: false }
        : { readOnlyHint: false, destructiveHint: true, openWorldHint: false }
    },
    guard(async ({ method, path, body, max_bytes }): Promise<ToolResult> => {
      if (method === 'GET') {
        if (path === undefined || path.length === 0) {
          return fail(new Error('GET needs a path, for example "show/version".'));
        }
      } else {
        if (ctx.readOnly) {
          return fail(
            new Error(
              'This server is running read-only, so POST is refused. Use GET to read, or ' +
                'ask the user to restart the server without --read-only.'
            )
          );
        }
        if (body === undefined) {
          return fail(new Error('POST needs a body, for example {"show": {"version": {}}}.'));
        }
      }

      const result =
        method === 'GET'
          ? await ctx.client.rci.get(path as string)
          : await ctx.client.rci.post(body);

      // max_bytes may only tighten the ceiling: a tool argument must not be able
      // to overrun the budget the operator configured with --max-response-bytes.
      const ceiling = Math.min(ctx.maxResponseBytes, max_bytes ?? ctx.maxResponseBytes);
      return ok(result, ceiling);
    })
  );
}
