import sessionQueue from "./sessionQueue";
import Whatsapp from "../models/Whatsapp";

// Processa os jobs na fila
sessionQueue.process(5, async (job) => {
  const { sessionId, sessionData } = job.data;

  try {
    // Recupera o WhatsApp associado e atualiza a sessão
    const whatsapp = await Whatsapp.findOne({ where: { id: sessionId } });

    if (whatsapp) {
      await whatsapp.update({ session: JSON.stringify(sessionData) });
      console.log(`Sessão ${sessionId} sincronizada com sucesso.`);
    } else {
      console.warn(`WhatsApp com ID ${sessionId} não encontrado.`);
    }
  } catch (error) {
    console.error(`Erro ao sincronizar sessão ${sessionId}: ${error.message}`);
    throw error; // Reprocessa em caso de erro
  }
});

sessionQueue.on("failed", (job, err) => {
  console.error(`Job de sessão ${job.id} falhou com o erro: ${err.message}`);
});

sessionQueue.on("completed", (job) => {
  console.log(`Job de sessão ${job.id} foi concluído com sucesso.`);
});
