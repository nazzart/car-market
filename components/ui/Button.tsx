import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Кнопки сайта — «таблетки» в нескольких вариантах. С href — ссылка (Link с текущим языком), без — <button>.
// Служит и серверным, и клиентским компонентам

const variants = {
  primary: "bg-primary hover:bg-primary-hover text-white font-semibold",
  dark: "bg-gray-900 hover:bg-black text-white font-semibold",
  outline: "border border-gray-200 bg-white hover:border-gray-900 text-gray-900 font-medium",
  ghost: "text-gray-700 hover:bg-gray-100 hover:text-black font-medium",
  danger: "bg-error hover:opacity-90 text-white font-semibold",
  dangerOutline: "border border-gray-200 bg-white hover:border-error hover:text-error text-gray-900 font-medium",
  white: "bg-white hover:bg-gray-100 text-gray-900 font-semibold", // на тёмном фоне
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-base",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string };

// Классы кнопки — для элементов, которые не могут быть <Button> (например, кнопка внутри чужого компонента)
export function buttonClass({ variant = "primary", size = "md", fullWidth, className }: StyleProps = {}) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 shrink-0 rounded-full whitespace-nowrap transition cursor-pointer",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );
}

type Common = StyleProps & { icon?: React.ReactNode; children?: React.ReactNode };
type AsButton = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };
type AsLink = Common & Omit<React.ComponentProps<typeof Link>, "className"> & { href: React.ComponentProps<typeof Link>["href"] };

export default function Button(props: AsButton | AsLink) {
  const { variant, size, fullWidth, className, icon, children, ...rest } = props;
  const classes = buttonClass({ variant, size, fullWidth, className });

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<AsLink, keyof Common>)} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }
  const { type = "button", ...buttonProps } = rest as Omit<AsButton, keyof Common>;
  return (
    <button type={type} {...buttonProps} className={classes}>
      {icon}
      {children}
    </button>
  );
}

// Круглая кнопка со значком (меню «⋯», закрыть). label обязателен — его прочитает экранный диктор
export function IconButton({
  label,
  className,
  children,
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-900 text-gray-700 transition cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900",
        className
      )}
    >
      {children}
    </button>
  );
}
