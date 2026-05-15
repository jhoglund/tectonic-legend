/** iOS-style large-title screen header. Respects the top safe-area inset. */
export function ScreenHeader({ title }: { title: string }) {
  return (
    <header
      className="px-4 pb-2"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
    >
      <h1
        className="text-3xl font-semibold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h1>
    </header>
  );
}
