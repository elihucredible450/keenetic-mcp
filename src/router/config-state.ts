import type { Rci } from './rci.js';

const STARTUP_CONFIG = '/ci/startup-config.txt';

/** The router stamps the saved configuration with its own checksum, in a header comment. */
const SAVED_CHECKSUM = /^!\s*\$+\s*Md5 checksum:\s*([0-9a-f]{32})/im;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

export interface ConfigState {
  lastChangedAt: string | null;
  lastChangedBy: string | null;
  lastChangedVia: string | null;
  runningChecksum: string | null;
  savedChecksum: string | null;
  /** null when the saved checksum could not be read - never a guess. */
  unsavedChanges: boolean | null;
  failSafe: { unsaved: boolean; rollbackPending: boolean; secondsLeft: unknown };
}

/**
 * Whether the running configuration still differs from the one in flash.
 *
 * `show/last-change` carries a `fail-safe.unsaved` flag that reads like the
 * answer and is not: it tracks the fail-safe rollback timer, not the saved
 * state. Measured on KeeneticOS 5.1.1, three objects were removed over RCI and
 * the flag stayed `false` throughout, while startup-config.txt was still
 * byte-for-byte the old one - a reboot would have restored everything.
 *
 * The checksum is the signal that actually moves, so the running one is
 * compared against the header the router writes into startup-config.txt. That
 * costs one extra fetch of about 17 KB, which is why it is not done on every
 * call in the hot path - only where the saved state is the question being asked.
 */
export async function readConfigState(rci: Rci): Promise<ConfigState> {
  const raw = asRecord(await rci.get('show/last-change'));
  const failSafe = asRecord(raw['fail-safe']);
  const runningChecksum = typeof raw['checksum'] === 'string' ? raw['checksum'] : null;

  let savedChecksum: string | null = null;
  try {
    savedChecksum = SAVED_CHECKSUM.exec(await rci.getText(STARTUP_CONFIG))?.[1] ?? null;
  } catch {
    // Reporting "saved" on a failed read would be the very error this replaces.
    savedChecksum = null;
  }

  return {
    lastChangedAt: typeof raw['date'] === 'string' ? raw['date'] : null,
    lastChangedBy: typeof raw['user'] === 'string' ? raw['user'] : null,
    lastChangedVia: typeof raw['agent'] === 'string' ? raw['agent'] : null,
    runningChecksum,
    savedChecksum,
    unsavedChanges:
      runningChecksum === null || savedChecksum === null
        ? null
        : runningChecksum !== savedChecksum,
    failSafe: {
      unsaved: failSafe['unsaved'] === true,
      rollbackPending: failSafe['rollback'] === true,
      secondsLeft: failSafe['time-left'] ?? 0
    }
  };
}
