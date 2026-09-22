import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "default" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">{label}</span>
          <span className="text-xl font-semibold tracking-tight">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}
