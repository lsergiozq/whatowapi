import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import SendMessage from "../helpers/SendMessage";
import GetWhatsAppByName from "../helpers/GetWhatsAppByIdClient";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import SendWhatsAppMedia from "../helpers/SendWhatsAppMedia";
import * as fs from 'fs/promises'; // Certifique-se de usar a versão do fs que suporta Promises
import Queue from 'bull';
import Redis from 'ioredis'; // Use ioredis para verificação do status

// Configuração da fila com estratégia de reconexão
const messageQueue = new Queue(`messageQueue${process.env.API_ID}`, {
  redis: {
    host: '127.0.0.1',
    port: 6379,
    retryStrategy: function (times) {
      // Aguarda 5 segundos antes de tentar novamente
      return Math.min(times * 50, 5000);
    }
  }
});

// Verificação do estado do Redis
const redisClient = new Redis(); // Conectar ao Redis para verificar seu status

const checkRedisReady = async (): Promise<void> => {
  try {
    const info = await redisClient.info();
    if (info.includes("loading:1")) {
      throw new Error("Redis is still loading the dataset into memory.");
    }
  } catch (error) {
    console.error('Erro ao verificar o status do Redis:', error);
    throw error;
  }
};

// Lidar com erro de conexão com o Redis
messageQueue.on('error', (error) => {
  console.error('Erro de conexão com o Redis:', error);
});

// Tratamento para jobs travados
messageQueue.on('stalled', (job) => {
  console.error(`Job ${job.id} travou e foi reiniciado.`);
});

// Definir o processador da fila com tratamento de erros
messageQueue.process(async (job, done) => {
  try {
    await checkRedisReady(); // Verifique se o Redis está pronto antes de processar
    const { whatsapp, number, body, media } = job.data;

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

  try {
    await checkRedisReady(); // Verifique se o Redis está pronto antes de adicionar à fila

    const whatsapp = await GetWhatsAppByName(newContact.idclient);

    // Adiciona as mensagens na fila com tratamento de promessas
    if (medias && medias.length > 0) {
      medias.forEach((media: Express.Multer.File) => {
        messageQueue.add({
          whatsapp,
          number: newContact.number,
          body: messageData.body,
          media,
        }).catch((error) => {
          console.error('Erro ao adicionar mídia à fila:', error);
        });
      });
    } else {
      await messageQueue.add({
        whatsapp,
        number: newContact.number,
        body: messageData.body,
      }).catch((error) => {
        console.error('Erro ao adicionar mensagem à fila:', error);
      });
    }

    return res.send();
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return res.status(500).json({ message: "Erro ao processar a solicitação." });
  }
};
