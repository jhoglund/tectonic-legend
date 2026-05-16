/**
 * Voucher codes (backlog item 17a) — a fully local, no-backend way to
 * grant premium. A code carries its own grant (lifetime, or N days) and
 * a checksum; the app verifies it offline. This is the path to comp a
 * friend, a tester, or press *today*, before any StoreKit / Apple work.
 *
 * Security posture: the salt is embedded in the (private) app bundle,
 * so codes are not trivially forgeable by a casual user — but this is a
 * friends-and-testers mechanism, not DRM. One-time-use is enforced only
 * per-device (no server). Real paid subscriptions, App Store offer
 * codes, and price discounts are separate — see item 17 / 17a.
 */

/** Salt mixed into every checksum. Embedded — see the posture note. */
const SALT = 'tectonic-voucher-v1-9c2f';

/** What a redeemed voucher grants. `days: 0` means a lifetime grant. */
export interface VoucherGrant {
  /** Premium duration in days; 0 = lifetime. */
  days: number;
}

export function isLifetime(grant: VoucherGrant): boolean {
  return grant.days === 0;
}

const CODE_RE = /^TEC-([0-9A-Z]{4})-([0-9A-Z]{4})$/;
/** days fits in 2 base-36 chars: 0..1295. */
const MAX_DAYS = 36 * 36 - 1;

/** FNV-1a — a small deterministic string hash (checksum use only). */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 4-char base-36 checksum of a code body. */
function checksum(body: string): string {
  return (hash(body + SALT) % (36 ** 4))
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
}

/** Two random base-36 chars — makes each minted code unique. */
function nonce(): string {
  let s = '';
  for (let i = 0; i < 2; i++) {
    s += Math.floor(Math.random() * 36).toString(36);
  }
  return s.toUpperCase();
}

/**
 * Mint a voucher code. `days = 0` mints a lifetime voucher. Use this to
 * generate codes to hand out (see docs/handover for a starter batch).
 */
export function mintVoucher(days: number): string {
  if (!Number.isInteger(days) || days < 0 || days > MAX_DAYS) {
    throw new Error(`voucher days must be an integer 0..${MAX_DAYS}`);
  }
  const dayCode = days.toString(36).toUpperCase().padStart(2, '0');
  const body = dayCode + nonce();
  return `TEC-${body}-${checksum(body)}`;
}

/**
 * Verify a voucher code and return its grant, or null if the code is
 * malformed or its checksum does not match. Case- and space-insensitive.
 */
export function verifyVoucher(code: string): VoucherGrant | null {
  const normalized = code.trim().toUpperCase();
  const m = CODE_RE.exec(normalized);
  if (!m) return null;
  const [, body, check] = m;
  if (checksum(body) !== check) return null;
  const days = parseInt(body.slice(0, 2), 36);
  if (Number.isNaN(days)) return null;
  return { days };
}
