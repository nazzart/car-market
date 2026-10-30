import { cn, formatNumber } from "@/lib/utils";

type OdometerProps = { value: number; className?: string };

// Число, цифры которого прокручиваются, как на одометре, когда значение меняется («Rādīt 15» → «Rādīt 7»).
// Первый показ — без анимации; при prefers-reduced-motion — тоже. Читалкам экрана — обычный текст
export default function Odometer({ value, className }: OdometerProps) {
  const text = formatNumber(value);
  const chars = [...text];

  return (
    <span className={cn("inline-flex align-top tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((char, i) => {
          // разряды считаются справа: при 99 → 100 единицы и десятки остаются собой и крутятся, а не появляются заново
          const place = chars.length - i;
          return /\d/.test(char) ? <Digit key={`d${place}`} digit={Number(char)} /> : <span key={`s${place}`}>{char}</span>;
        })}
      </span>
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type DigitProps = { digit: number };

function Digit({ digit }: DigitProps) {
  return (
    <span className="relative inline-block h-[1lh] overflow-hidden">
      <span
        className="flex flex-col transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1lh]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
