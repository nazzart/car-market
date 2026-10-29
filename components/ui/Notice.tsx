import BlockIcon from "@mui/icons-material/Block";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { cn } from "@/lib/utils";

// Заметная плашка с пояснением и, если нужно, кнопкой: решение модератора, «объявление скрыто», «заполните профиль»
const tones = {
  danger: { box: "bg-danger-soft border-danger-muted text-danger-strong", Icon: BlockIcon },
  warning: { box: "bg-warning-soft border-warning-muted text-warning-strong", Icon: InfoOutlinedIcon },
};

// Белая кнопка-«таблетка» для action: <Button variant="outline" size="sm"> или эти классы на ссылке

export default function Notice({
  tone,
  icon,
  title,
  children,
  action,
  className,
}: {
  tone: keyof typeof tones;
  icon?: React.ReactNode; // по умолчанию — значок тона
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { box, Icon } = tones[tone];

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-card border", box, className)}>
      {icon ?? <Icon className="shrink-0" />}
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        {children && <div className="text-sm">{children}</div>}
      </div>
      {action}
    </div>
  );
}
