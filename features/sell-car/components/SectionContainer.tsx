type Props = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionContainer({ id, title, description, children }: Props) {
  return (
    <section
      id={id}
      className="
          scroll-mt-24
          bg-white
          rounded-xl
          p-6
          border border-gray-200
          shadow-[0_4px_16px_rgba(0,0,0,0.08)]
        "
    >
      <div className="mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>

        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>

      {children}
    </section>
  );
}
