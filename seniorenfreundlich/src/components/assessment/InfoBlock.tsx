interface Props {
  label: string;
  description?: string;
}

export function InfoBlock({ label, description }: Props) {
  return (
    <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{label}</p>
      {description && (
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{description}</p>
      )}
    </div>
  );
}
