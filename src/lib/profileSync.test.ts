import { describe, it, expect } from 'vitest';
import { reconcile } from './profileSync';
import { defaultProfile } from './profile';

describe('reconcile — last-write-wins', () => {
  it('keeps whichever profile has the newer updatedAt', () => {
    const older = {
      ...defaultProfile(),
      updatedAt: '2026-05-01T00:00:00.000Z',
    };
    const newer = {
      ...defaultProfile(),
      updatedAt: '2026-05-10T00:00:00.000Z',
    };
    expect(reconcile(older, newer)).toBe(newer);
    expect(reconcile(newer, older)).toBe(newer);
  });

  it('keeps the local profile on a tie', () => {
    const ts = '2026-05-05T00:00:00.000Z';
    const local = { ...defaultProfile(), updatedAt: ts };
    const remote = { ...defaultProfile(), updatedAt: ts };
    expect(reconcile(local, remote)).toBe(local);
  });

  it('lets any real profile beat a pristine (epoch) one', () => {
    const pristine = defaultProfile(); // updatedAt = epoch
    const real = {
      ...defaultProfile(),
      updatedAt: new Date().toISOString(),
    };
    expect(reconcile(pristine, real)).toBe(real);
    expect(reconcile(real, pristine)).toBe(real);
  });
});
