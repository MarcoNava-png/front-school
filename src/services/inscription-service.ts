import { PayloadInscription } from "@/types/inscription";

import apiClient from "./api-client";

export async function createInscription(payload: PayloadInscription): Promise<void> {
  await apiClient.post(`/inscripciones`, payload);
}
