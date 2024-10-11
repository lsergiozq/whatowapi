import axios from "axios";
import FormData from "form-data";

class WebhookService {
  public async send(payload: any, retryCount = 0): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL || "http://example.com/webhook";
    const maxRetries = 3;
      
    // Cria um novo form-data
    const formData = new FormData();
    formData.append("TID", "1234");
    formData.append("NSU", "payload");

    try {
      console.log("Enviando para o webhook:" + webhookUrl, payload);
      await axios.post(webhookUrl, formData, {
        headers: {
          ...formData.getHeaders(), // Inclui os headers apropriados para o form-data
        },
      });
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
