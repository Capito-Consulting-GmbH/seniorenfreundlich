import { Link } from "@/src/i18n/navigation";

export function WordMark() {
  return (
    <Link
      href="/"
      className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors"
    >
      Seniorenfreundlich.org
    </Link>
  );
}
