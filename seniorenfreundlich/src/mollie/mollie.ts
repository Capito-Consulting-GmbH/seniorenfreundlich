import createMollieClient from "@mollie/api-client";
import { env } from "@/src/env";

export const mollieClient = createMollieClient({
  apiKey: env.MOLLIE_API_KEY,
});
