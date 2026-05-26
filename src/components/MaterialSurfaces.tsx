import type { CSSProperties, ReactNode } from 'react';

export function CompactAppBar({
  title,
  eyebrow,
  left,
  right,
}: {
  title: string;
  eyebrow?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header
      className="grid items-center px-1"
      style={{
        gridTemplateColumns: '48px 1fr 48px',
        minHeight: '64px',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="grid place-items-center">{left}</div>
      <div className="min-w-0 text-center">
        {eyebrow && (
          <p
            className="text-xs font-medium uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em',
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="truncate text-lg font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
      </div>
      <div className="grid place-items-center">{right}</div>
    </header>
  );
}

export function IconButton({
  label,
  children,
  onClick,
  inverse = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  inverse?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid cursor-pointer place-items-center rounded-full"
      style={{
        width: 48,
        height: 48,
        color: inverse ? 'var(--text-on-brand)' : 'var(--text-primary)',
      }}
    >
      {children}
    </button>
  );
}

export function TonalCard({
  children,
  tonal = false,
  accent = true,
  className = '',
  style,
}: {
  children: ReactNode;
  tonal?: boolean;
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{
        background: tonal ? 'var(--brand-100)' : 'var(--surface-elevated)',
        border: tonal ? '1px solid transparent' : '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        boxShadow: tonal ? undefined : 'var(--shadow-card)',
        ...style,
      }}
    >
      {accent && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0"
          style={{
            width: 'var(--space-1)',
            background: 'var(--brand-600)',
          }}
        />
      )}
      <div className={accent ? 'pl-1' : undefined}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="px-2 text-xs font-medium uppercase"
      style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}
    >
      {children}
    </p>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-4 text-sm font-medium disabled:cursor-default"
      style={{
        background: 'var(--brand-600)',
        borderRadius: 'var(--radius-button)',
        color: 'var(--text-on-brand)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-4 text-sm font-medium disabled:cursor-default"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-button)',
        color: 'var(--text-primary)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
