/** iOS-style large-title screen header. Respects the top safe-area inset. */
export function ScreenHeader({ title }: { title: string }) {
  return (
    <header className="px-4 pt-4 pb-2">
      <h1
        className="text-3xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h1>
    </header>
  );
}
