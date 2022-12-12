import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import GetWhatsAppByIdClient from "../helpers/GetWhatsAppByIdClient";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappIdClient } = req.params;

  const whatsappClient = await GetWhatsAppByIdClient(whatsappIdClient);

  return res.status(200).json(whatsappClient);
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });
  await DeleteBaileysService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const removeApi = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappIdClient } = req.params;

  const whatsappClient = await GetWhatsAppByIdClient(whatsappIdClient);

  if (whatsappClient)
  { 
    await DeleteBaileysService(whatsappClient.id);
    const wbot = getWbot(whatsappClient.id);
    wbot.logout();
    await DeleteWhatsAppService(whatsappClient.id.toString());
    
    removeWbot(+whatsappClient.id);
  
   const io = getIO();
   io.emit("whatsapp", {
      action: "delete",
      whatsappId: +whatsappClient.id
   });
}

  return res.status(200).json({ message: "Session disconnected." });
};

const updateApi = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappIdClient } = req.params;

  const whatsappClient = await GetWhatsAppByIdClient(whatsappIdClient);

  if(whatsappClient)
  {
    const { whatsapp } = await UpdateWhatsAppService({
      whatsappId: whatsappClient.id.toString(),
      whatsappData: { session: "" }
    });
    await DeleteBaileysService(whatsappClient.id);

    StartWhatsAppSession(whatsapp);

    return res.status(200).json({ message: "Starting session." });
  } else  {
    res.status(200).json({ message: "IdClient não encontrado." });
  }

};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);
  await DeleteBaileysService(whatsappId);

  const wbot = getWbot(whatsapp.id);

  wbot.logout();

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update, updateApi, show, removeApi };
