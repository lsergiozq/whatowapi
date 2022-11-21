import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetWhatsAppByIdClient = async (idclient: string): Promise<Whatsapp> => {

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { idclient: idclient }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_IDCLIENT_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetWhatsAppByIdClient;
