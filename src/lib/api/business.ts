import { apiClient } from "./auth";

export interface BotStatus {
  whatsappNumber: string | null;
  configured: boolean;
  lastActivity: string | null;
}

export const businessService = {
  async getBotStatus(): Promise<BotStatus> {
    const response = await apiClient.get<BotStatus>("/business/bot-status");
    return response.data;
  },

  async updateWhatsappNumber(whatsappNumber: string): Promise<void> {
    await apiClient.patch("/business/whatsapp-number", { whatsappNumber });
  },
};
