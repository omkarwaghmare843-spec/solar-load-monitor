import { LucideIcon } from "lucide-react";

export default function Card({
  title,
  icon: Icon,
  iconColor,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" style={{ color: iconColor }} />}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
