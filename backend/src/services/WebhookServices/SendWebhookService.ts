import axios from "axios";
import qs from "qs";  // Importa a biblioteca qs para formatar os dados como x-www-form-urlencoded

class WebhookService {
  public async send(payload: any, retryCount = 0): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL || "http://example.com/webhook";
    const maxRetries = 3;
      
    //temporário
    payload = { TID: '123456', NSU: '654321' };

    // Converte o payload para o formato x-www-form-urlencoded
    const data = qs.stringify(payload);

    try {
      console.log("Enviando para o webhook:" + webhookUrl, payload);
      await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
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
