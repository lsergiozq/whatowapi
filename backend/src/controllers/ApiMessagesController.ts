import { Request, Response } from "express";
import messageQueue from "../bull/messageQueue"; // Fila de mensagens


export const sendtext = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const newContact = req.body;
    const messageData = req.body;

    console.log("newContact", newContact);

    const addImage = false;

    if (!newContact.number) {
      throw new Error("Número de contato não fornecido");
    }

    newContact.number = newContact.number.replace("-", "").replace(" ", "");

    // Verifica a prioridade que vem junto da mensagem - messageData.priority
    // messageData.priority é string e precisa converter para number numa nova variável ou constante
    // e se a priotity não existir, o valor padrão é 1

    let priority = 1;
    if (messageData.priority) {
      priority = parseInt(messageData.priority);
    }

    // Adiciona o job à fila para ser processado
    await messageQueue.add(
      { messageData, addImage },
      {
        attempts: 3, // Tenta 3 vezes em caso de falha
        removeOnComplete: true, // Remove da fila após processar
        removeOnFail: false, // Remove da fila em caso de falha
        timeout: 60000, // 60 segundos para processar o job,
        priority: priority, // Prioridade do job
      }
    );

    console.log("Mensagem adicionada à fila para processamento");

    return res.status(200).json({ message: "Mensagem adicionada à fila para processamento" });

  } catch (error) {
    console.error("Erro ao adicionar job à fila:", error);
    return res.status(500).json({ message: "Erro ao processar requisição" });
  }
};

export const sendimage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const newContact = req.body;
    const messageData = req.body;
    const addImage = true;

    if (!newContact.number) {
      throw new Error("Número de contato não fornecido");
    }

    newContact.number = newContact.number.replace("-", "").replace(" ", "");

    // Verifica a prioridade que vem junto da mensagem - messageData.priority
    // messageData.priority é string e precisa converter para number numa nova variável ou constante
    // e se a priotity não existir, o valor padrão é 1

    let priority = 1;
    if (messageData.priority) {
      priority = parseInt(messageData.priority);
    }

    // Adiciona o job à fila para ser processado
    await messageQueue.add(
      { messageData, addImage },
      {
        attempts: 3, // Tenta 3 vezes em caso de falha
        removeOnComplete: true, // Remove da fila após processar
        removeOnFail: true, // Remove da fila em caso de falha
        timeout: 60000, // 60 segundos para processar o job,
        priority: priority, // Prioridade do job
      }
    );

    console.log("Mensagem adicionada à fila para processamento");

    return res.status(200).json({ message: "Mensagem adicionada à fila para processamento" });

  } catch (error) {
    console.error("Erro ao adicionar job à fila:", error);
    return res.status(500).json({ message: "Erro ao processar requisição" });
  }
};
