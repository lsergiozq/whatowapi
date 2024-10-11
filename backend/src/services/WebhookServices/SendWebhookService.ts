import axios from "axios";

class WebhookService {
  public async send(payload: any, retryCount = 0): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL || "http://example.com/webhook";
    const maxRetries = 3;

    payload = {
        authorizationId: "abc123def456",
        referenceId: "ref789ghi012"
    };
      

    try {
      console.log("Enviando para o webhook:" + webhookUrl, payload);
      await axios.post(webhookUrl, payload);
    } catch (error) {
      console.error(`Erro ao enviar para o webhook: ${error.message}`);

      // Limita o número de tentativas de reenvio
      if (retryCount < maxRetries) {
        setTimeout(() => {
          this.send(payload, retryCount + 1);
        }, 5000);
      } else {
        console.error("Falha ao enviar webhook após múltiplas tentativas");
      }
    }
  }
}

export default new WebhookService();
