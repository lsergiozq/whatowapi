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

    // Envia a mensagem (texto ou mídia)
    if (medias && medias.length > 0) {
      for (const media of medias) {
        await SendWhatsAppMedia({ whatsapp, media, body: messageData.body, number: newContact.number });
        await fs.unlink(media.path); // Remove arquivo após envio
      }
    } else {
      await SendMessage(whatsapp, { number: newContact.number, body: messageData.body });
    }

    // Notifica o webhook com sucesso
    await WebhookService.send({
      status: "success",
      contact: newContact,
      message: messageData
    });

  } catch (error) {
    console.error("Erro ao processar a mensagem:", error);

    // Notifica o webhook com erro
    await WebhookService.send({
      status: "error",
      contact: newContact,
      message: messageData,
      error: error.message
    });
  }

  // Remove o job após processamento
  await job.remove();
});
