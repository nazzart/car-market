import { cn } from "@/lib/utils";

// Значки в стиле контрольных ламп приборной панели: «плюсы» и «минусы» машины в объявлении и в списке.
// Цвет — от текста метки (зелёный — хорошо, жёлтый — внимание), лёгкое свечение — класс dash-glow (app/globals.css).
// Гаечный ключ — по мотивам Lucide (ISC)

type DashIconProps = { size?: number; className?: string };

type DashSvgProps = DashIconProps & { children: React.ReactNode };

function DashSvg({ size = 18, className, children }: DashSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("dash-glow shrink-0", className)}
    >
      {children}
    </svg>
  );
}

// Машина спереди — «без аварий»
export function CarFrontIcon(props: DashIconProps) {
  return (
    <DashSvg {...props}>
      <path d="M6.5 10 8.2 5.8q.3-.8 1.1-.8h5.4q.8 0 1.1.8l1.7 4.2" />
      <rect x="3.5" y="10" width="17" height="6.5" rx="2" />
      <path d="M6 16.5v2.5M18 16.5v2.5" />
      <circle cx="7.5" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="13.2" r="1" fill="currentColor" stroke="none" />
    </DashSvg>
  );
}

// Ключ — владельцы
export function KeyIcon(props: DashIconProps) {
  return (
    <DashSvg {...props}>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M18 12v3M21 12v2.5" />
    </DashSvg>
  );
}

// Наклейка техосмотра «TA»
export function InspectionIcon(props: DashIconProps) {
  return (
    <DashSvg {...props}>
      <circle cx="12" cy="12" r="9" />
      <text x="12" y="15.2" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" stroke="none">
        TA
      </text>
    </DashSvg>
  );
}

// Гаечный ключ — нужно обслуживание
export function ServiceIcon(props: DashIconProps) {
  return (
    <DashSvg {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
    </DashSvg>
  );
}

// «Check engine» — нужен ремонт
export function EngineIcon(props: DashIconProps) {
  return (
    <DashSvg {...props}>
      <path d="M3 10v6M3 13h2" />
      <path d="M5 9.5h3V7.5h6v2h2l2 2h1V10h2v6.5h-2V15h-1l-2 2.5H8l-3-3z" />
    </DashSvg>
  );
}
