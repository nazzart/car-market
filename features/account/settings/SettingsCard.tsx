type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function SettingsCard({ title, description, children }: Props) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>

      {children}
    </section>
  );
}
