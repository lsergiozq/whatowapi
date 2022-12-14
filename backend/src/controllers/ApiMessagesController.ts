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

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const whatsapp = await GetWhatsAppByName(newContact.idclient);
  
  if (medias && medias.length > 0) {
    console.log(medias);
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia(
            { 
              whatsapp: whatsapp,
              media: media,
              body: messageData.body,
              number: newContact.number, 
            });
      })
    );
  } else {
    console.log(medias);
    await SendMessage(whatsapp, 
      { 
          number: newContact.number, 
          body: messageData.body  
      });
  }
  
  
  return res.send();
};




