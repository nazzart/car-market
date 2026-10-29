type AuthHeaderProps = { title: string; subtitle?: string };

// Общие элементы окон входа и регистрации

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="text-center mb-7">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
    </header>
  );
}

type TextLinkButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export function TextLinkButton({
  onClick,
  children,
}: TextLinkButtonProps) {
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
