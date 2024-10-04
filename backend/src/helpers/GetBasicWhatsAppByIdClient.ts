import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetBasicWhatsAppByIdClient = async (idclient: string): Promise<Whatsapp> => {

  const defaultWhatsapp = await Whatsapp.findOne({
    attributes: ['id', 'qrcode', 'status', 'battery', 'plugged', 'createdAt', 'updatedAt', 'idclient', 'retries', 'description', 'name', 'idapi'],
    where: { idclient: idclient }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_IDCLIENT_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetBasicWhatsAppByIdClient;
