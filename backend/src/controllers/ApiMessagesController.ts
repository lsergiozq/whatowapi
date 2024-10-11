import { Request, Response } from "express";
import messageQueue from "../bull/messageQueue"; // Fila de mensagens
import * as fs from "fs/promises";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newContact = req.body;
    const messageData = req.body;
    const medias = req.files as Express.Multer.File[];

    if (!newContact.number) {
      throw new Error("Número de contato não fornecido");
    }

    newContact.number = newContact.number.replace("-", "").replace(" ", "");

    // Adiciona o job à fila para ser processado
    await messageQueue.add(
      { newContact, messageData, medias },
      {
        attempts: 3, // Tenta 3 vezes em caso de falha
        backoff: 5000, // Espera 5 segundos entre as tentativas
        removeOnComplete: true, // Remove o job ao completar
        removeOnFail: true // Remove o job ao falhar
      }
    );

    return res.status(200).json({ message: "Mensagem adicionada à fila para processamento" });
  } catch (error) {
      console.error("Erro ao adicionar job à fila:", error);
    return res.status(500).json({ message: "Erro ao processar requisição" });
  }
};
