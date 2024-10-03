import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket"

import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";

interface SessionData {
  idclient: string;
  description: string;
}

export const insert = async (req: Request, res: Response): Promise<Response> => {
  const sessionData: SessionData = req.body;

  //verifica se process.env.API_ID possui valor, caso não atribui 1
  if(!process.env.API_ID){
    process.env.API_ID = '1';
  }

  //converte process.env.API_ID para inteiro
  const apiId = parseInt(process.env.API_ID || '1', 10);
  
  const { whatsapp } = await CreateWhatsAppService({
    idclient: sessionData.idclient,
    description: sessionData.description,
    idapi: apiId
  });
  
  StartWhatsAppSession(whatsapp);
  
  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });
  
  return res.status(200).json(whatsapp);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const sessionData: SessionData = req.body;
  
  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  // await DeleteWhatsAppService(whatsappId);
  // removeWbot(+whatsappId);

  // const io = getIO();
  // io.emit("whatsapp", {
  //   action: "delete",
  //   whatsappId: +whatsappId
  // });

  return res.status(200).json({ message: "Whatsapp deleted." });
};


