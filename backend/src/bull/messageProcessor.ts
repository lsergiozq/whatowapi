import messageQueue from "./messageQueue";
import SendMessage from "../helpers/SendMessage";
import GetWhatsAppByName from "../helpers/GetWhatsAppByIdClient";
import SendWhatsAppMedia from "../helpers/SendWhatsAppMedia";
import * as fs from "fs/promises";
import WebhookService from "../services/WebhookServices/SendWebhookService";

// Processa os jobs na fila
messageQueue.process(5, async (job) => {
  const { newContact, messageData, medias } = job.data;

  try {
    const whatsapp = await GetWhatsAppByName(newContact.idclient);

    console.log("Enviando mensagem para:", newContact.number);
    // Envia a mensagem (texto ou mídia)
    if (medias && medias.length > 0) {
      for (const media of medias) {
        console.log("medias");
        await SendWhatsAppMedia({ whatsapp, media, body: messageData.body, number: newContact.number });
        await fs.unlink(media.path); // Remove arquivo após envio
      }
    } else {
        console.log("texto");
      await SendMessage(whatsapp, { number: newContact.number, body: messageData.body });
    }
    console.log("sucesso");
    
    // Notifica o webhook com sucesso
    await WebhookService.send({
      status: "success",
      contact: newContact,
      message: messageData
    });

    // console.log("removendo job sucesso");
    // // Remover o job manualmente
    await job.remove(); // Remover job manualmente ao final do processamento

    return Promise.resolve();

  } catch (error) {
    console.error("Erro ao processar a mensagem:", error);

    // Notifica o webhook com erro
    await WebhookService.send({
      status: "error",
      contact: newContact,
      message: messageData,
      error: error.message
    });

    console.log("removendo job erro");
    // Remover o job mesmo que tenha falhado
    await job.remove(); // Remover o job mesmo em caso de falha

    return Promise.reject(error);
  }

});

messageQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} falhou com o erro: ${err.message}`);
  });
  
messageQueue.on("completed", (job) => {
console.log(`Job ${job.id} foi concluído com sucesso.`);
});

messageQueue.on("stalled", (job) => {
console.warn(`Job ${job.id} travou e será reprocessado.`);
});
