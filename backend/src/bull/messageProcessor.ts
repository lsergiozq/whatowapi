import messageQueue from "./messageQueue";
import SendMessage from "../helpers/SendMessage";
import GetWhatsAppByName from "../helpers/GetWhatsAppByIdClient";
import SendWhatsAppMedia from "../helpers/SendWhatsAppMedia";
import WebhookService from "../services/WebhookServices/SendWebhookService";

// Processa os jobs na fila
messageQueue.process(5, async (job) => {
  const { messageData, addImage } = job.data;

  try {
    const whatsapp = await GetWhatsAppByName(messageData.idclient);

    // Envia a mensagem (texto ou mídia)
    if (addImage) {
      //obtem a imagem que está na tabela do whatsapps através do idclient	
      const imagebase64 = whatsapp.imagebase64;
      await SendWhatsAppMedia({ whatsapp, imagebase64, body: messageData.body, number: messageData.number });
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
