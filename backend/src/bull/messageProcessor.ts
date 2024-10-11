import messageQueue from "./messageQueue";
import SendMessage from "../helpers/SendMessage";
import GetWhatsAppByName from "../helpers/GetWhatsAppByIdClient";
import SendWhatsAppMedia from "../helpers/SendWhatsAppMedia";
import * as fs from "fs/promises";
import WebhookService from "../services/WebhookServices/SendWebhookService";

// Processa os jobs na fila
messageQueue.process(5, async (job) => {
  const { messageData, medias } = job.data;

  try {
    const whatsapp = await GetWhatsAppByName(messageData.idclient);

    // Envia a mensagem (texto ou mídia)
    if (medias && medias.length > 0) {
      for (const media of medias) {
        await SendWhatsAppMedia({ whatsapp, media, body: messageData.body, number: messageData.number });
        await fs.unlink(media.path); // Remove arquivo após envio
      }
    } else {
      await SendMessage(whatsapp, { number: messageData.number, body: messageData.body });
    }
    
    // Notifica o webhook com sucesso
    await WebhookService.send({
      status: "success",
      message: messageData
    });
  } catch (error) {
    // Notifica o webhook com erro
    await WebhookService.send({
      status: "error",
      message: messageData,
      error: error.message
    });
  }

});

messageQueue.on("failed", (job, err) => {
    //console.error(`Job ${job.id} falhou com o erro: ${err.message}`);
});
  
messageQueue.on("completed", (job) => {
    //console.log(`Job ${job.id} foi concluído com sucesso.`);
});

messageQueue.on("stalled", (job) => {
    //console.warn(`Job ${job.id} travou e será reprocessado.`);
});
