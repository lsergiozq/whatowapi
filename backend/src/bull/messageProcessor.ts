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

    console.log("whatsapp ", whatsapp);
    console.log("Enviando mensagem para ", messageData);
    console.log("addImage: ", addImage);


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
    console.error("Erro ao processar job:", error); // Log detalhado do erro
    // Notifica o webhook com erro
    await WebhookService.send({
      status: "error",
      message: messageData,
      error: error.message
    });
  }

});

messageQueue.on("ready", () => {
  console.log("Queue is ready!");
});

messageQueue.on("error", (error) => {
  console.error("Queue error:", error);
});

messageQueue.on("active", (job) => {
  console.log(`Job ${job.id} is now active`);
});

messageQueue.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed`);
});

messageQueue.on("failed", (job, error) => {
  console.error(`Job ${job.id} has failed:`, error);
});
