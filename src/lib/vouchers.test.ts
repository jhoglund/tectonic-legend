import { describe, it, expect } from 'vitest';
import { mintVoucher, verifyVoucher, isLifetime } from './vouchers';

describe('vouchers', () => {
  it('mints a code that verifies back to its grant', () => {
    const code = mintVoucher(30);
    const grant = verifyVoucher(code);
    expect(grant).toEqual({ days: 30 });
    expect(isLifetime(grant!)).toBe(false);
  });

  it('mints a lifetime voucher (days 0)', () => {
    const grant = verifyVoucher(mintVoucher(0));
    expect(grant).toEqual({ days: 0 });
    expect(isLifetime(grant!)).toBe(true);
  });

  it('is case- and whitespace-insensitive', () => {
    const code = mintVoucher(7);
    expect(verifyVoucher(`  ${code.toLowerCase()} `)).toEqual({ days: 7 });
  });

  it('rejects a tampered code', () => {
    const code = mintVoucher(30);
    // flip a character in the body
    const bad = code.replace(/^TEC-./, (s) => s.slice(0, 4) + (s[4] === 'A' ? 'B' : 'A'));
    expect(verifyVoucher(bad)).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(verifyVoucher('not-a-code')).toBeNull();
    expect(verifyVoucher('')).toBeNull();
    expect(verifyVoucher('TEC-XXXX-XXXX')).toBeNull();
  });

  it('mints unique codes for the same grant', () => {
    const a = mintVoucher(30);
    const b = mintVoucher(30);
    // the nonce makes collisions vanishingly unlikely
    expect(a).not.toBe(b);
  });
});
