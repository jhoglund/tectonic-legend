interface KeypadProps {
  maxNumber: number;
  onNumber: (n: number) => void;
}

/**
 * The number-entry keypad — circular keys 1..maxNumber (solving-shapes
 * graduation, variant 11). The keys flex to fill the row, capped so
 * they stay a comfortable tap target. Undo lives in the toolbar now;
 * per-cell clearing is the toolbar's Clear.
 */
export function Keypad({ maxNumber, onNumber }: KeypadProps) {
  return (
    <div className="flex w-full justify-center gap-2">
      {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onNumber(n)}
          className="solve-key"
        >
          {n}
        </button>
      ))}
    </div>
  );
}
