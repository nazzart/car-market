import { cn } from "@/lib/utils";

// Плитка с числом: «3 Pieejamie auto», «128 просмотров»
export default function StatTile({
  value,
  label,
  icon: Icon,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ElementType<{ fontSize?: "small"; className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("p-4 rounded-2xl bg-gray-50", className)}>
      {Icon && <Icon fontSize="small" className="text-gray-500 mb-2" />}
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
