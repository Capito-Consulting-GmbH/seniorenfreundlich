import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function StatCard({ label, value, description, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
