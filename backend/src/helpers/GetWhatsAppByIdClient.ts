import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetWhatsAppByIdClient = async (idclient: string): Promise<Whatsapp> => {

  //verifica se process.env.API_ID possui valor, caso não atribui 1
  if(!process.env.API_ID){
    process.env.API_ID = '1';
  }

  //converte process.env.API_ID para inteiro
  const apiId = parseInt(process.env.API_ID || '1', 10);

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { 
      idclient: idclient,
      idapi: apiId
    }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_IDCLIENT_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetWhatsAppByIdClient;
