import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

export const ShowWhatsAppService = async (id: string | number): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findByPk(id, {
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export const ShowWhatsAppServiceByIdClient = async (idclient: string | number): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findOne({
    attributes: ['id', 'qrcode', 'status', 'battery', 'plugged', 'createdAt', 'updatedAt', 'idclient', 'retries', 'description', 'name', 'idapi'],
    where: { idclient: idclient }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};


