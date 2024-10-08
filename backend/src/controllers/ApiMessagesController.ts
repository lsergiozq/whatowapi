import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket"
import SendMessage from "../helpers/SendMessage";
import GetWhatsAppByName from "../helpers/GetWhatsAppByIdClient";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import SendWhatsAppMedia from "../helpers/SendWhatsAppMedia";
import * as fs from 'fs/promises'; // Certifique-se de usar a versão do fs que suporta Promises
import Queue from 'bull';

const messageQueue = new Queue(`messageQueue`, {
  redis: { host: '127.0.0.1', port: 6379 },
});

type WhatsappData = {
  whatsappId: number;
};

type MessageData = {
  body: string;
  fromMe: boolean;
};

interface ContactData {
  idclient: string,
  number: string
}

interface SessionData {
  key: string;
}

// Definir o processador da fila
messageQueue.process(async (job, done) => {
  const { whatsapp, number, body, media } = job.data;
  
  try {
    if (media) {
      await SendWhatsAppMedia({ whatsapp, media, body, number });
      await fs.unlink(media.path);
    } else {
      await SendMessage(whatsapp, { number, body });
    }
    done();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    done(error);
  }
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const whatsapp = await GetWhatsAppByName(newContact.idclient);

  // Adiciona as mensagens na fila
  if (medias && medias.length > 0) {
    medias.forEach((media: Express.Multer.File) => {
      messageQueue.add({
        whatsapp,
        number: newContact.number,
        body: messageData.body,
        media,
      });
    });
  } else {
    messageQueue.add({
      whatsapp,
      number: newContact.number,
      body: messageData.body,
    });
  }

  return res.send();
};





