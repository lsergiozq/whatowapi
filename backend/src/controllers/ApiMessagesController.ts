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

const messageQueue = new Queue(`messageQueue${process.env.API_ID}`, {
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

// Função para verificar se o Redis está pronto
const checkRedisReady = async (queue: Queue.Queue): Promise<void> => {
  return new Promise((resolve, reject) => {
    const check = () => {
      queue.client.ping((err, result) => {
        if (err) {
          reject(err);
        } else if (result === 'PONG') {
          resolve();
        } else {
          setTimeout(check, 1000); // Tenta novamente após 1 segundo
        }
      });
    };
    check();
  });
};

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

  // Verifica se o Redis está pronto antes de adicionar trabalhos à fila
  await checkRedisReady(messageQueue);

  // Adiciona as mensagens na fila
  if (medias && medias.length > 0) {
    for (const media of medias) {
      await messageQueue.add({
        whatsapp,
        number: newContact.number,
        body: messageData.body,
        media,
      });
    }
  } else {
    await messageQueue.add({
      whatsapp,
      number: newContact.number,
      body: messageData.body,
    });
  }

  return res.send();
};