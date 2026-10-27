// Общие элементы окон входа и регистрации

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Кнопки-«таблетки» в стиле сайта
export const pillSx = {
  height: 48,
  borderRadius: "999px",
  fontWeight: 600,
  fontSize: 15,
};

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="text-center mb-7">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
    </header>
  );
}

export function TextLinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-gray-900 underline underline-offset-4 hover:text-primary transition cursor-pointer"
    >
      {children}
    </button>
  );
}
