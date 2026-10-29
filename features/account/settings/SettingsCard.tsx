import Card from "@/components/ui/Card";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function SettingsCard({ title, description, children }: Props) {
  return (
    <Card as="section" size="panel">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>

      {children}
    </Card>
  );
}
