import Card from "@/components/ui/Card";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function SettingsCard({ title, description, children }: SettingsCardProps) {
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
