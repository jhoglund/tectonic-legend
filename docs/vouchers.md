# Voucher codes

The buildable half of backlog item 17a: a fully local way to grant
Tectonic Premium — **no Apple account, no backend, no admin UI**. The
path to comp a friend, a tester, or press today.

A code carries its own grant and a salted checksum, so the app verifies
it offline. Redeeming sets the profile entitlement (`tier: 'premium'`,
with an expiry for timed grants); `isPremium()` is the source of truth.

> **What this is not.** App Store offer codes (Apple's own voucher
> mechanism) and real subscription price discounts still ride on the
> StoreKit work — see backlog item 17 / 17a. And note: no feature is
> gated on premium *yet* — that waits on the free/premium split
> decision (ADR-0007 re-derivation). Today a redeemed code flips the
> entitlement and shows "Premium" in Settings; gating follows.

## Redeeming

Settings → **Tectonic Premium** → **Redeem a code** → enter the code.
Codes are case- and space-insensitive.

## Starter codes

Minted 2026-05-16. Each is single-use **per device** (no server, so
the same code can be redeemed once on each tester's device — which is
usually what you want for a tester batch).

**Lifetime**
```
TEC-00JB-LU5A
TEC-00YA-LXHC
TEC-00YO-GIC2
TEC-00I7-CFLM
TEC-00M1-4KOS
```

**30 days** (a time-boxed comp — the local stand-in for a temporary offer)
```
TEC-0U3F-97NW
TEC-0UVB-1MK1
TEC-0UUQ-EB9N
TEC-0U5R-7102
TEC-0UDY-HHXA
```

**7 days**
```
TEC-07RE-PEI2
TEC-07IB-WT24
TEC-07DP-9PL3
```

## Minting more

`mintVoucher(days)` in `src/lib/vouchers.ts` issues codes — `days = 0`
mints a lifetime code, `1..1295` a timed one. One-liner:

```bash
npx tsx -e "import('./src/lib/vouchers.ts').then(v => { for (let i=0;i<5;i++) console.log(v.mintVoucher(30)); })"
```

## Limitations (by design, for v1)

- **Per-device one-time-use only.** Cross-device single-use needs a
  server; out of scope.
- **The checksum salt is embedded** in the (private) app bundle. Codes
  are not casually forgeable, but this is a friends-and-testers
  mechanism, not DRM.
- Timed grants **extend** an existing grant and never downgrade a
  lifetime one.
