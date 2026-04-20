import { notFound } from "next/navigation";
import { getConfigById } from "@/src/services/assessmentConfigService";
import { BuilderClient } from "./BuilderClient";
import type { AssessmentConfig } from "@/src/validators/assessment";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ configId: string }>;
}) {
  const { configId } = await params;
  const config = await getConfigById(configId);
  if (!config) notFound();

  const parsedConfig = config.config as unknown as AssessmentConfig;
  const title = config.title as { de: string; en: string };

  return (
    <BuilderClient
      configId={config.id}
      initialConfig={parsedConfig}
      initialTitle={title}
      status={config.status}
      version={config.version}
    />
  );
}
