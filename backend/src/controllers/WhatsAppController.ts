import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ListGridWhatsAppsService from "../services/WhatsappService/ListGridWhatsAppsService";
import { ShowWhatsAppService } from "../services/WhatsappService/ShowWhatsAppService";
import { UpdateWhatsAppService }  from "../services/WhatsappService/UpdateWhatsAppService";
import ListDisconnectedWhatsAppsService from "../services/WhatsappService/ListDisconnectedWhatsAppsService";

interface WhatsappData {
  idclient: string;
  description?: string;
  status?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const indexGrid = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListGridWhatsAppsService();

  //retorna a lista de idclients
  return res.status(200).json(whatsapps);
};

export const indexDisconnected = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListDisconnectedWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    idclient,
    status,
    description,
  }: WhatsappData = req.body;

  const { whatsapp } = await CreateWhatsAppService({
    idclient,
    status,
    description
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId
  });

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });
  
  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  await DeleteWhatsAppService(whatsappId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
