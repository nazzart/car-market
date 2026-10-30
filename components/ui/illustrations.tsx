import { cn } from "@/lib/utils";

// Небольшие линейные рисунки для пустых состояний: «ничего не нашлось», «избранное пусто», 404.
// Только SVG в коде — без картинок и анимаций; цвета — из палитры сайта. Для читалок экрана — украшение (aria-hidden)

type IllustrationProps = { className?: string };

const svgProps = {
  viewBox: "0 0 200 120",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// Машина сбоку (седан), колёса на линии y = 93. dx — сдвиг по горизонтали
type SideCarProps = { dx?: number };

function SideCar({ dx = 0 }: SideCarProps) {
  return (
    <g transform={`translate(${dx} 0)`}>
      <path
        d="M56 86V74q0-7 7-8l14-2 13-13q3-3 8-3h20q5 0 8 3l11 12 5 1q6 1 6 8v14z"
        className="fill-white stroke-gray-400"
      />
      <path d="M85 63l9-9q1.5-1.5 4-1.5h6V63z" className="fill-gray-100 stroke-gray-300" />
      <path d="M108 52.5h9q3 0 4.5 1.5l9 9H108z" className="fill-gray-100 stroke-gray-300" />
      <path d="M140 70h4" className="stroke-primary" strokeWidth={3} />
      <circle cx="76" cy="86" r="9" className="fill-white stroke-gray-500" />
      <circle cx="126" cy="86" r="9" className="fill-white stroke-gray-500" />
      <circle cx="76" cy="86" r="3" className="fill-gray-300" stroke="none" />
      <circle cx="126" cy="86" r="3" className="fill-gray-300" stroke="none" />
    </g>
  );
}

// Дорога: обочина и прерывистая разметка
function Road() {
  return (
    <>
      <path d="M8 95h184" className="stroke-gray-300" />
      <path d="M20 106h16M52 106h16M84 106h16M116 106h16M148 106h16" className="stroke-gray-200" strokeWidth={3} />
    </>
  );
}

// Ничего не нашлось: машина на пустой дороге у знака с вопросом
export function EmptyRoad({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={cn("w-44 h-auto", className)}>
      <Road />
      <SideCar dx={-24} />
      <path d="M164 95V52" className="stroke-gray-400" />
      <circle cx="164" cy="40" r="14" className="fill-white stroke-primary" strokeWidth={3} />
      <path d="M159.5 36.5q0-5 4.5-5t4.5 4.5q0 3-4.5 4.5V43" className="stroke-gray-700" />
      <circle cx="164" cy="47.5" r="0.5" className="stroke-gray-700" strokeWidth={2.5} />
    </svg>
  );
}

// Избранное пусто: парковка сверху — одно место занято, на свободном нарисовано сердце
export function EmptyParking({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={cn("w-44 h-auto", className)}>
      <path d="M30 14v92M86 14v92M142 14v92M198 14v92M30 14h168" className="stroke-gray-300" />
      {/* машина сверху на первом месте */}
      <rect x="40" y="28" width="36" height="66" rx="12" className="fill-white stroke-gray-300" />
      <rect x="45" y="42" width="26" height="13" rx="4" className="fill-gray-100 stroke-gray-300" />
      <rect x="45" y="72" width="26" height="9" rx="3" className="fill-gray-100 stroke-gray-300" />
      {/* свободное место с сердцем */}
      <path
        d="M114 76s-16-9.5-16-21q0-8 8-8 5 0 8 5 3-5 8-5 8 0 8 8 0 11.5-16 21z"
        className="stroke-primary"
        strokeDasharray="4 4"
        strokeWidth={2.5}
      />
      <path d="M152 50h10q6 0 6 6t-6 6h-10V50zm0 12v12" className="stroke-gray-200" strokeWidth={3} />
    </svg>
  );
}

// 404: дорога перекрыта — машина у полосатого шлагбаума
export function RoadClosed({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={cn("w-48 h-auto", className)}>
      <Road />
      <SideCar dx={-30} />
      <path d="M148 95V66M184 95V66" className="stroke-gray-400" />
      <clipPath id="barrier">
        <rect x="136" y="54" width="60" height="12" rx="3" />
      </clipPath>
      <g clipPath="url(#barrier)">
        <rect x="136" y="54" width="60" height="12" className="fill-white" />
        <path d="M134 70l14-20M150 70l14-20M166 70l14-20M182 70l14-20" className="stroke-primary" strokeWidth={6} />
      </g>
      <rect x="136" y="54" width="60" height="12" rx="3" className="stroke-gray-400" />
    </svg>
  );
}
